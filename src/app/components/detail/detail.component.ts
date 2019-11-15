import { Component, OnInit, NgZone } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Shedule } from "../../shared/model/shedule";
import * as dialogs from "tns-core-modules/ui/dialogs";
import * as application from "tns-core-modules/application";
import { Accuracy } from "tns-core-modules/ui/enums"; // used to describe at what accuracy the location should be get
import * as utils from "tns-core-modules/utils/utils";
import { device } from "tns-core-modules/platform/platform";
import * as geolocation from "nativescript-geolocation";
import { BackgroundServiceClass } from "~/app/shared/services/backgound-service";
import { DetailDriverServiceService } from "~/app/shared/services/detail-driver-service.service";
import * as Toast from "nativescript-toast";

var applications = require("application");
let watchIds = [];
const jobId = 308; // the id should be unique for each background job. We only use one, so we set the id to be the same each time.
declare var com: any;

@Component({
    selector: "ns-detail-driver-service",
    templateUrl: "./detail.component.html",
    styleUrls: ["./detail.component.css"]
})
export class DetailDriverServiceComponent implements OnInit {
    public listPauseReasons: any[] = [];
    public driversServices: Shedule;
    public showStop: boolean;
    public showPause: boolean;
    public showPlay: boolean;
    public locations: any[] = [];
    public lat: String = "";
    private idService: number;
    public dialogOpen = false;
    private parametersGeoLocalization: any;

    constructor(
        private route: ActivatedRoute,
        private listServices: DetailDriverServiceService
    ) {
        application.on(application.exitEvent, this._stopBackgroundJob);
        let context = application.android.context;
        const self = this;
        // App went to background...
        applications.on(application.suspendEvent, function(args) {
            if (args.android) {
                // For Android applications, args.android is an android activity class.
                console.log("Activity: " + args.android);
                let toast = Toast.makeText("PAT Se ejecuta en SEGUNDO plano");
                toast.show();

                if (!self.showPlay) self.startBackgroundTap();
            } else if (args.ios) {
                // For iOS applications, args.ios is UIApplication.
                console.log("UIApplication: " + args.ios);
            }
        });

        // App was reopened...
        applications.on(application.resumeEvent, function(args) {
            if (args.android) {
                // For Android applications, args.android is an android activity class.
                console.log("Activity: " + args.android);
                let toast = Toast.makeText("PAT Se ejecuta en PRIMER plano");
                toast.show();
                if (!self.showPlay) self.stopBackgroundTap();
            } else if (args.ios) {
                // For iOS applications, args.ios is UIApplication.
                console.log("UIApplication: " + args.ios);
            }
        });
    }

    sendGeoLocalization() {
        this.parametersGeoLocalization = {};
        this.parametersGeoLocalization.id = 5;
        this.parametersGeoLocalization.lat = 10;
        this.parametersGeoLocalization.lon = 15;

        this.listServices
            .sendGeoLocalization(this.parametersGeoLocalization)
            .subscribe(
                result => {
                    this.driversServices = result;
                    //this.pullRefresh.refreshing = false;
                    console.log(result);
                    this.getListPauseReasons();
                },
                error => {
                    console.log(error.err);
                }
            );
    }
    showConfirmActionStart() {
        dialogs
            .confirm({
                title: "Transportes",
                message: "Desea iniciar el servicio",
                okButtonText: "Aceptar",
                cancelButtonText: "Cancelar"
            })
            .then(result => {
                // result argument is boolean
                if (result) {
                    this.showStop = true;
                    this.showPause = true;
                    this.showPlay = false;
                    // Get current location with high accuracy
                    //this.startBackgroundTap();
                    this.buttonStartTap();
                }
                console.log("Dialog result: " + result);
            });
    }
    showConfirmActionPausa() {
        var self = this;
        dialogs
            .action({
                message: "Seleccione la causa",
                cancelButtonText: "Cancel",
                actions: self.listPauseReasons.map(e => e.nombre)
            })
            .then(function(result) {
                if (result != "Cancel") {
                    self.showPause = false;
                    self.showPlay = true;
                    self.stopBackgroundTap();
                    console.log(
                        "Dialog result: " +
                            self.listPauseReasons.find(e => e.nombre == result)
                                .id
                    );
                }
            });
    }
    showConfirmActionStop() {
        dialogs
            .confirm({
                title: "Transportes",
                message: "Está seguro de finalizar el servicio?",
                okButtonText: "Aceptar",
                cancelButtonText: "Cancelar"
            })
            .then(result => {
                // result argument is boolean
                if (result) {
                    this.showStop = false;
                    this.showPause = false;
                    this.showPlay = true;
                    // Get current location with high accuracy
                    this.stopBackgroundTap();
                }
                console.log("Dialog result: " + result);
            });
    }
    _stopBackgroundJob() {
        if (application.android) {
            let context = utils.ad.getApplicationContext();
            const jobScheduler = context.getSystemService(
                (<any>android.content.Context).JOB_SCHEDULER_SERVICE
            );
            if (jobScheduler.getPendingJob(jobId) !== null) {
                jobScheduler.cancel(jobId);
                console.log(`Job Canceled: ${jobId}`);
            }
        }
    }
    startBackgroundTap() {
        if (application.android) {
            let context = utils.ad.getApplicationContext();
            if (device.sdkVersion >= "26") {
                const jobScheduler = context.getSystemService(
                    (<any>android.content.Context).JOB_SCHEDULER_SERVICE
                );
                const component = new android.content.ComponentName(
                    context,
                    BackgroundServiceClass.class
                );
                const builder = new (<any>android.app).job.JobInfo.Builder(
                    jobId,
                    component
                );
                builder.setOverrideDeadline(0);
                jobScheduler.schedule(builder.build());
            } else {
                let intent = new android.content.Intent(
                    context,
                    com.nativescript.location.BackgroundService.class
                );
                context.startService(intent);
            }
        }
    }
    stopBackgroundTap() {
        if (application.android) {
            if (device.sdkVersion >= "26") {
                this._stopBackgroundJob();
            } else {
                let context = utils.ad.getApplicationContext();
                let intent = new android.content.Intent(
                    context,
                    BackgroundServiceClass.class
                );
                context.stopService(intent);
            }
        }
        this.sendGeoLocalization();
    }
    enableLocationTap() {
        geolocation.isEnabled().then(
            function(isEnabled) {
                if (!isEnabled) {
                    geolocation
                        .enableLocationRequest(true, true)
                        .then(
                            () => {
                                console.log("User Enabled Location Service");
                            },
                            e => {
                                console.log("Error: " + (e.message || e));
                            }
                        )
                        .catch(ex => {
                            console.log("Unable to Enable Location", ex);
                        });
                }
            },
            function(e) {
                console.log("Error: " + (e.message || e));
            }
        );
    }
    buttonGetLocationTap() {
        geolocation
            .getCurrentLocation({
                desiredAccuracy: Accuracy.high,
                updateDistance: 1,
                updateTime: 3000,
                minimumUpdateTime: 100
            })
            .then(
                function(loc) {
                    if (loc) {
                        this.locations.push(loc);
                    }
                },
                function(e) {
                    console.log("Error: " + (e.message || e));
                }
            );
    }

    buttonStartTap() {
        try {
            const self = this;
            watchIds.push(
                geolocation.watchLocation(
                    function(loc) {
                        if (loc) {
                            self.locations.push(loc);
                            let toast = Toast.makeText(
                                `FOREGROUND Latitud ${loc.latitude} longitud ${
                                    loc.longitude
                                } altura ${loc.altitude} velocidad ${
                                    loc.speed > 5 ? 0 : loc.speed
                                }`
                            );
                            toast.show();
                            console.log(
                                `FOREGROUND Latitud ${loc.latitude} longitud ${
                                    loc.longitude
                                } altura ${loc.altitude} velocidad ${
                                    loc.speed > 5 ? 0 : loc.speed
                                }`
                            );
                        }
                    },
                    function(e) {
                        console.log("Error: " + e.message);
                    },
                    {
                        desiredAccuracy: Accuracy.high,
                        updateDistance: 0.1,
                        updateTime: 1000,
                        iosAllowsBackgroundLocationUpdates: true,
                        iosPausesLocationUpdatesAutomatically: false,
                        iosOpenSettingsIfLocationHasBeenDenied: true
                    }
                )
            );
        } catch (ex) {
            console.log("Error: " + ex.message);
        }
    }

    buttonStopTap() {
        let watchId = watchIds.pop();
        while (watchId != null) {
            geolocation.clearWatch(watchId);
            watchId = watchIds.pop();
        }
    }

    buttonClearTap() {
        this.locations.splice(0, this.locations.length);
    }
    ngOnInit() {
        this.showStop = false;
        this.showPause = false;
        this.showPlay = true;
        let self = this;
        this.route.queryParams.subscribe(params => {
            self.driversServices = JSON.parse(params["selectedService"]);
            self.idService = self.driversServices.id;
            console.log(`Id seleccionado ${self.driversServices.id}`);
        });

        this.enableLocationTap();
        this.getListServicesByDriver();
    }
    getListServicesByDriver() {
        this.listServices
            .getListServicesByDriverDetail(this.idService)
            .subscribe(
                result => {
                    this.driversServices = result;
                    //this.pullRefresh.refreshing = false;
                    console.log(result);
                    this.getListPauseReasons();
                },
                error => {
                    console.error("error...");
                }
            );
    }

    getListPauseReasons() {
        this.listServices.getListPauseReasons().subscribe(
            result => {
                this.listPauseReasons = result;
                //this.pullRefresh.refreshing = false;
                console.log(result);
            },
            error => {
                //this.showMessageDialog(error.err);
            }
        );
    }
    puaseServiceTap() {
        this.showDialog();
    }

    showDialog() {
        this.dialogOpen = true;
    }

    closeDialog() {
        this.dialogOpen = false;
    }
}
