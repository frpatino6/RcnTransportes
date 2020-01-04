import { Component, OnInit, NgZone, AfterViewInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Shedule } from "../../shared/model/shedule";
import { Accuracy } from "tns-core-modules/ui/enums"; // used to describe at what accuracy the location should be get
import { device } from "tns-core-modules/platform/platform";
import { BackgroundServiceClass } from "~/app/shared/services/backgound-service";
import { DetailDriverServiceService } from "~/app/shared/services/detail-driver-service.service";
import { BackgroundFetch } from "nativescript-background-fetch";
import { LocationViewModel } from "~/app/shared/model/location";
import { DateFormatPipe } from "~/app/shared/pipes/date-format-pipe";
import * as dialogs from "tns-core-modules/ui/dialogs";
import * as application from "tns-core-modules/application";
import * as utils from "tns-core-modules/utils/utils";
import * as geolocation from "nativescript-geolocation";


var Sqlite = require("nativescript-sqlite");
var applications = require("application");

const jobId = 308; // the id should be unique for each background job. We only use one, so we set the id to be the same each time.
declare var com: any;

@Component({
    selector: "ns-detail-driver-service",
    templateUrl: "./detail.component.html",
    styleUrls: ["./detail.component.css"]
})
export class DetailDriverServiceComponent implements OnInit, AfterViewInit {
    public listPauseReasons: any[] = [];
    public driversServices: Shedule;
    public showStop: boolean = false;
    public showPause: boolean = false;
    public showPlay: boolean = true;
    public locations: LocationViewModel[] = [];
    public backgroundIds = [];
    public watchIds = [];
    public lat: String = "";
    private idService: number;
    private statusService = 0;
    public dialogOpen = false;
    private _counter: number;
    private _message: string;
    private database: any;
    private BGids: any = [];

    constructor(
        private route: ActivatedRoute,
        private _dateFormatPipe: DateFormatPipe,
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
        this.getListPauseReasons();

        applications.on(application.suspendEvent, args => {
            const self = this;
            if (args.android) {
                // For Android applications, args.android is an android activity class.                            

                //     if (!self.showPlay) self.startBackgroundTap();
                // } else if (args.ios) {
                //     // For iOS applications, args.ios is UIApplication.
                // }
                // if (!self.showPlay) {
                // }
            }
        });

        // App was reopened...
        applications.on(application.resumeEvent, args => {
            if (args.android) {
                // For Android applications, args.android is an android activity class.                                
                // this.stopBackgroundTap();
            } else if (args.ios) {
                // For iOS applications, args.ios is UIApplication.
            }
        });
        this.initDatabase();
        this.initListener();
        this.asyncLocalization();
    }
    ngAfterViewInit(): void {
        this.fetchServicesStatus();
    }
    public ngOnDestroy() {
        //this.stopBackgroundTap()
    }
    initDatabase() {
        new Sqlite("pat.db").then(
            db => {
                db.execSQL(
                    "CREATE TABLE IF NOT EXISTS location (lat DECIMAL(10,2) ,lon DECIMAL(10,2), dateInput TEXT)"
                ).then(
                    id => {
                        this.database = db;
                    },
                    error => {
                        console.log("CREATE TABLE ERROR", error);
                    }
                );
                db.execSQL(
                    "CREATE TABLE IF NOT EXISTS serviceInfo ( id NUMBER, status NUMBER)"
                ).then(
                    id => {
                        console.log(`Create table serviceInfo create ok`);
                        this.database = db;
                    },
                    error => {
                        console.log("CREATE TABLE serviceInfo ERROR ", error);
                    }
                );
            },
            error => {
                console.log("OPEN DB ERROR", error);
            }
        );
    }
    public insert(lat: number, lon: number, time: String) {
        this.database
            .execSQL(
                "INSERT INTO location (lat, lon ,dateInput) VALUES (?, ?, ?)",
                [lat, lon, time]
            )
            .then(
                id => {
                    //console.log("INSERT RESULT", lat);
                },
                error => {
                    //console.log("INSERT ERROR", error);
                }
            );
    }
    public updateService(status: number) {
        this.database
            .execSQL("INSERT INTO serviceInfo (id,status) VALUES (?, ?)", [
                this.idService,
                status
            ])
            .then(
                id => {
                    console.log("INSERT RESULT ID SERVICES", this.idService);
                },
                error => {
                    //console.log("INSERT ERROR", error);
                }
            );
    }
    public fetch() {
        this.database.all("SELECT * FROM location").then(
            rows => {
                this.locations = [];
                for (var row in rows) {
                    this.locations.push({
                        Latitude: rows[row][0],
                        Longitude: rows[row][1],
                        FechaHora: rows[row][2]
                    });
                }
                let parameter = JSON.stringify(this.locations);
                this.listServices
                    .sendGeoLocalization(parameter, this.idService)
                    .subscribe(
                        result => {
                            this.locations = [];
                        },
                        error => {
                            console.error(`error... fetch ${error}`);
                        }
                    );
            },
            error => {
                console.log("SELECT ERROR", error);
            }
        );
    }
    public fetchServicesStatus() {
        this.database
            .all(`SELECT * FROM serviceInfo where id = ${this.idService}`)
            .then(
                rows => {
                    for (var row in rows) {
                        this.idService = Number(rows[row][0]);
                        this.statusService = Number(rows[row][1]);
                    }
                    if (this.statusService == 1) {
                        //started
                        this.showPause = true;
                        this.showPlay = false;
                        this.showStop = true;
                        this.buttonStartTap();
                    }
                    if (this.statusService == 2) {
                        //paused
                        this.showPause = false;
                        this.showPlay = true;
                        this.showStop = true;
                    }
                    if (this.statusService == 3) {
                        //started
                        this.showPause = false;
                        this.showPlay = true;
                        this.showStop = false;
                    }
                },
                error => {
                    console.log("SELECT ERROR", error);
                }
            );
    }
    public getLocations() {
        this.database.all("SELECT * FROM location").then(
            rows => {
                this.locations = [];
                for (var row in rows) {
                    this.locations.push({
                        Latitude: rows[row][0],
                        Longitude: rows[row][1],
                        FechaHora: rows[row][2]
                    });
                }
                if (this.locations.length > 0) {
                }
            },
            error => {
                console.log("SELECT ERROR", error);
            }
        );
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
    private updateMessage() {
        this.message = this._counter + " BackgroundFetch events received";
        console.log("...updateMessage... " + this.message);
        this.locations.forEach(item => {});
        this.sendLocation();
        this.clearTableSql();
    }
    clearTableSql() {
        if (this.database != undefined) {
            this.database.execSQL("delete from location");
        }
    }
    clearTableStatusServices() {
        if (this.database != undefined) {
            this.database.execSQL("delete from serviceInfo");
        }
    }
    onLoaded() {
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
        BackgroundFetch.status((status: any) => {
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
        // Initialize default values.
        this._counter = 0;
        this.updateMessage();
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
                    self.updateService(2); //status paused = 2
                    self.statusService = 2;
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
            const jobScheduler = context.getSystemService((<any>android.content.Context).JOB_SCHEDULER_SERVICE);
            if (jobScheduler.getPendingJob(jobId) !== null) {
                jobScheduler.cancel(jobId);
                console.log(`Job Canceled: ${jobId}`);
            }
        }
    }
    startBackgroundTap() {
        if (application.android) {
            if (application.android) {
                let context = utils.ad.getApplicationContext();
                if (device.sdkVersion >= "26") {
                    const jobScheduler = context.getSystemService((<any>android.content.Context).JOB_SCHEDULER_SERVICE);
                    const component = new android.content.ComponentName(context, BackgroundServiceClass.class);
                    const builder = new (<any>android.app).job.JobInfo.Builder(jobId, component);
                    builder.setOverrideDeadline(0);
                    jobScheduler.schedule(builder.build());
                    if (jobScheduler.getPendingJob(jobId) !== null) {
                       // jobScheduler.cancel(jobId);
                        console.log(`Job initialized: ${jobId}`);
                    }
                } else {
                    let intent = new android.content.Intent(context, BackgroundServiceClass.class);
                    context.startService(intent);
                }
            }
        }
    }
    stopBackgroundTap() {
        if (application.android) {
            if (device.sdkVersion >= "26") {
                this._stopBackgroundJob();
            } else {
                let context = utils.ad.getApplicationContext();
                let intent = new android.content.Intent(context, BackgroundServiceClass.class);
                context.stopService(intent);
            }
        }
        this.sendLocation();
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
            this.startBackgroundTap();
            // const self = this;
            // self.updateService(1); //status started = 1
            // self.watchIds.push(
            //     geolocation.watchLocation(
            //         function(loc) {
            //             if (loc) {
            //                 let locationNew: LocationViewModel = new LocationViewModel();
            //                 let displayDate = self._dateFormatPipe.transform(
            //                     new Date()
            //                 ); //formatting current ///date here
            //                 locationNew.Latitude = loc.latitude;
            //                 locationNew.Longitude = loc.longitude;
            //                 locationNew.FechaHora = displayDate;
            //                 self.insert(
            //                     locationNew.Latitude,
            //                     locationNew.Longitude,
            //                     locationNew.FechaHora
            //                 );
            //                 //self.fetchServicesStatus();
            //                 const that = self;
            //                 if (loc.speed > 5 && that.statusService == 2) {
            //                     //SI LA VELOCIDAD ES MAYOR A 5 KMS/H REINICIA EL SERVICIOS
            //                     // self.buttonStartTap();
            //                     that.statusService = 1;
            //                     that.showPause = true;
            //                     that.showPlay = false;
            //                     that.showStop = true;
            //                 }
            //                 // console.log(
            //                 //     "F " +
            //                 //         loc.longitude +
            //                 //         "," +
            //                 //         loc.latitude
            //                 // );
            //                 // console.log(
            //                 //     `FOREGROUND Latitud ${loc.latitude} longitud ${loc.longitude} altura ${loc.altitude} velocidad ${loc.speed}`
            //                 // );
            //                 /* let toast = Toast.makeText(
            //                     `FOREGROUND Latitud ${loc.latitude} longitud ${loc.longitude} altura ${loc.altitude} velocidad ${loc.speed}`
            //                 );
            //                 toast.show();*/
            //                 //self.insert(loc.latitude, loc.longitude, "");
            //             }
            //         },
            //         function(e) {},
            //         {
            //             desiredAccuracy: Accuracy.high,
            //             updateDistance: 15,
            //             updateTime: 1000,
            //             iosAllowsBackgroundLocationUpdates: true,
            //             iosPausesLocationUpdatesAutomatically: false,
            //             iosOpenSettingsIfLocationHasBeenDenied: true
            //         }
            //     )
            // // );
            // BackgroundFetch.start(
            //     () => {
            //         console.log("BackgroundFetch successfully started");
            //     },
            //     status => {
            //         console.log("BackgroundFetch failed to start: ", status);
            //     }
            // );
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
        this.updateService(3); //status stoped = 3
        this.clearTableStatusServices();
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
    sendLocation() {
        //envia los datos de localización guardados durante los últimos 15 minutos
        this.fetch();
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
                    console.error("error... getListServicesByDriver...");
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
                this.showMessageDialog(error.err);
            }
        );
    }
    puaseServiceTap() {
        this.showDialog();
    }
    showDialog() {
        this.dialogOpen = true;
    }
    showMessageDialog(message: any) {
        let dialogs = require("tns-core-modules/ui/dialogs");
        dialogs
            .alert({
                title: "PAT",
                message: message,
                okButtonText: "Aceptar"
            })
            .then(function() {
                console.log("Dialog closed!");
            });
    }
    closeDialog() {
        this.dialogOpen = false;
    }
}
