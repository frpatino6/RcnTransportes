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
import { BackgroundFetch } from "nativescript-background-fetch";

var applications = require("application");

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
    public showStop: boolean = false;
    public showPause: boolean = false;
    public showPlay: boolean = true;
    public locations: any[] = [];
    public watchIds = [];
    public lat: String = "";
    private idService: number;
    public dialogOpen = false;
    private parametersGeoLocalization: any;
    private _counter: number;
    private _message: string;

    constructor(
        private route: ActivatedRoute,
        private listServices: DetailDriverServiceService
    ) {
        application.on(application.exitEvent, this._stopBackgroundJob);
        let context = application.android.context;
        const self = this;
        // App went to background...
    }
    ngOnInit() {
        this.showStop = false;
        this.showPause = false;
        this.showPlay = true;
        let self = this;
        this.route.queryParams.subscribe(params => {
            self.driversServices = JSON.parse(params["selectedService"]);
            self.idService = self.driversServices.id;
        });

        this.enableLocationTap();
        this.getListServicesByDriver();
        applications.on(application.suspendEvent, args => {
            const self = this;
            if (args.android) {
                // For Android applications, args.android is an android activity class.
                let toast = Toast.makeText("PAT Se ejecuta en SEGUNDO plano");
                toast.show();

                if (!self.showPlay) self.startBackgroundTap();
            } else if (args.ios) {
                // For iOS applications, args.ios is UIApplication.
            }
            if (!self.showPlay) {
                BackgroundFetch.start(
                    () => {
                        console.log("BackgroundFetch successfully started");
                    },
                    status => {
                        console.log(
                            "BackgroundFetch failed to start: ",
                            status
                        );
                    }
                );
            }
        });

        // App was reopened...
        applications.on(application.resumeEvent, args => {
            if (args.android) {
                // For Android applications, args.android is an android activity class.
                let toast = Toast.makeText("PAT Se ejecuta en PRIMER plano");
                toast.show();
                this.stopBackgroundTap();
            } else if (args.ios) {
                // For iOS applications, args.ios is UIApplication.
            }

            BackgroundFetch.stop(
                () => {
                    console.log("BackgroundFetch successfully stoped");
                },
                status => {
                    console.log("BackgroundFetch failed to stoped: ", status);
                }
            );
        });
        this.initListener();
        this.asyncLocalization();

        BackgroundFetch.stop(
            () => {
                console.log("BackgroundFetch successfully stoped");
            },
            status => {
                console.log("BackgroundFetch failed to stoped: ", status);
            }
        );
    }
    onLoaded(args) {
        console.log("onLoaded");
    }
    initListener() {
        if (application.ios) {
            class MyDelegate extends UIResponder {
                public static ObjCProtocols = [UIApplicationDelegate];

                public applicationPerformFetchWithCompletionHandler(
                    application: UIApplication,
                    completionHandler: any
                ) {
                    console.log("- AppDelegate Rx Fetch event");
                    BackgroundFetch.performFetchWithCompletionHandler(
                        completionHandler,
                        application.applicationState
                    );
                }
            }
            application.ios.delegate = MyDelegate;
        } else if (application.android) {
            BackgroundFetch.registerHeadlessTask(async () => {
                console.log("[BackgroundFetch] Demo Headless Task");
                let result = await doWork();
                BackgroundFetch.finish();
            });

            let doWork = () => {
                return new Promise((resolve, reject) => {
                    // Do some work.
                    console.log("doWork");
                    let result = true;
                    if (result) {
                        resolve("OK");
                    } else {
                        reject("OOPS!");
                    }
                });
            };
        }
    }

    asyncLocalization() {
        BackgroundFetch.status(status => {
            switch (status) {
                case BackgroundFetch.STATUS_RESTRICTED:
                    console.log("BackgroundFetch restricted");
                    break;
                case BackgroundFetch.STATUS_DENIED:
                    console.log("BackgroundFetch denied");
                    break;
                case BackgroundFetch.STATUS_AVAILABLE:
                    console.log("BackgroundFetch is enabled");
                    break;
            }
        });

        BackgroundFetch.configure(
            {
                minimumFetchInterval: 15,
                stopOnTerminate: false,
                startOnBoot: true,
                enableHeadless: true
            },
            function() {
                console.log(
                    `[BackgroundFetch] FERNANDO Event Received! ${this._counter}`
                );
                this._counter++;
                this.updateMessage();
                BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
            }.bind(this),
            function(error) {
                console.log("[BackgroundFetch] FAILED");
            }.bind(this)
        );

        // Initialize default values.
        this._counter = 0;
        this.updateMessage();
    }
    sendGeoLocalization() {
        this.parametersGeoLocalization = {};

        this.listServices
            .sendGeoLocalization(this.parametersGeoLocalization)
            .subscribe(
                result => {
                    this.driversServices = result;
                    this.getListPauseReasons();
                },
                error => {}
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
                    this.buttonStopTap();
                }
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
                console.log(`Job Scheduled: ${jobScheduler.schedule(builder.build())}`);
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
    public enableLocationTap() {
        console.log("enableLocationTap");
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
                function(e) {}
            );
    }

    buttonStartTap() {
        try {
            const self = this;
            self.watchIds.push(
                geolocation.watchLocation(
                    function(loc) {
                        if (loc) {
                            self.locations.push(loc);
                            /* let toast = Toast.makeText(
                                `FOREGROUND Latitud ${loc.latitude} longitud ${loc.longitude} altura ${loc.altitude} velocidad ${loc.speed}`
                            );
                            toast.show();*/
                            console.log(
                                `FOREGROUND Latitud ${loc.latitude} longitud ${loc.longitude} altura ${loc.altitude} velocidad ${loc.speed}`
                            );
                        }
                    },
                    function(e) {},
                    {
                        desiredAccuracy: Accuracy.high,
                        updateDistance: 0,
                        updateTime: 100,
                        iosAllowsBackgroundLocationUpdates: true,
                        iosPausesLocationUpdatesAutomatically: false,
                        iosOpenSettingsIfLocationHasBeenDenied: true
                    }
                )
            );
        } catch (ex) {}
    }

    buttonStopTap() {
        let watchId = this.watchIds.pop();
        while (watchId != null) {
            geolocation.clearWatch(watchId);
            watchId = this.watchIds.pop();
        }
        BackgroundFetch.stop(
            () => {
                console.log("BackgroundFetch successfully stoped");
            },
            status => {
                console.log("BackgroundFetch failed to stoped: ", status);
            }
        );
        this.stopBackgroundTap();
    }

    buttonClearTap() {
        this.locations.splice(0, this.locations.length);
    }

    get message(): string {
        return this._message;
    }
    set message(value: string) {
        if (this._message !== value) {
            this._message = value;
        }
    }

    private updateMessage() {
        this.message = this._counter + " BackgroundFetch events received";
    }
    getListServicesByDriver() {
        const self = this;
        this.listServices
            .getListServicesByDriverDetail(this.idService)
            .subscribe(
                result => {
                    Object.keys(result).forEach(
                        key => (self.driversServices[key] = result[key])
                    );
                    // self.driversServices =  result;
                    //this.pullRefresh.refreshing = false;

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
