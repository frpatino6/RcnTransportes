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

let watchIds = [];
const jobId = 308; // the id should be unique for each background job. We only use one, so we set the id to be the same each time.
declare var com: any;

@Component({
    selector: "ns-detail-driver-service",
    templateUrl: "./detail.component.html",
    styleUrls: ["./detail.component.css"]
})
export class DetailDriverServiceComponent implements OnInit {
    public driversServices: Shedule;
    public showStop: boolean;
    public showPause: boolean;
    public showPlay: boolean;
    public locations: any;
    public lat: String = "";

    constructor(private route: ActivatedRoute, private zone: NgZone) {
        application.on(application.exitEvent, this._stopBackgroundJob);
    }
    showConfirmAction() {
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
						  this.startBackgroundTap();
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
                return jobScheduler.schedule(builder.build());
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
                maximumAge: 5000,
                timeout: 10000
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
            watchIds.push(
                geolocation.watchLocation(
                    function(loc) {
                        if (loc) {
                            this.locations.push(loc);
                        }
                    },
                    function(e) {
                        console.log("Error: " + e.message);
                    },
                    {
                        desiredAccuracy: Accuracy.high,
                        updateDistance: 1,
                        updateTime: 3000,
                        minimumUpdateTime: 100
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
            console.log(self.driversServices.descripcionRecorrido);
        });

        this.enableLocationTap();
    }
}
