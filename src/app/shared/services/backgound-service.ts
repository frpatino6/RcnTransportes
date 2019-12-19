import * as geolocation from "nativescript-geolocation";
import { Accuracy } from "tns-core-modules/ui/enums";
import * as application from "tns-core-modules/application";
import { device } from "tns-core-modules/platform";
import { LocationViewModel } from "~/app/shared/model/location";

var Sqlite = require("nativescript-sqlite");
const ad = require("tns-core-modules/utils/utils").ad;
const _dateFormatPipe = require("../pipes/date-format-pipe");
let watchId;
let database: any;
function _clearWatch() {
    console.log("_clearWatch");
    if (watchId) {
        console.log(`WatchId ${watchId}`);
        geolocation.clearWatch(watchId);
        watchId = null;
    }
}
function initDatabase() {
    new Sqlite("pat.db").then(
        db => {
            db.execSQL(
                "CREATE TABLE IF NOT EXISTS location (lat DECIMAL(10,2) ,lon DECIMAL(10,2), dateInput TEXT)"
            ).then(
                id => {
                    database = db;
                },
                error => {
                    console.log("CREATE TABLE ERROR", error);
                }
            );
        },
        error => {
            console.log("OPEN DB ERROR", error);
        }
    );
}
function insert(lat, lon, time) {
    database
        .execSQL(
            "INSERT INTO location (lat, lon ,dateInput) VALUES (?, ?, ?)",
            [lat, lon, time]
        )
        .then(
            id => {
                //console.log("INSERT RESULT", lat);
            },
            error => {
                console.log("INSERT ERROR", error);
            }
        );
}
function _startWatch() {
    geolocation.enableLocationRequest().then(
        function() {
            _clearWatch();
            watchId = geolocation.watchLocation(
                function(loc) {
                    if (loc) {
                        let locationNew: LocationViewModel = new LocationViewModel();
                        // let displayDate = _dateFormatPipe.transform(new Date()); //formatting current ///date here
                        locationNew.Latitude = loc.latitude;
                        locationNew.Longitude = loc.longitude;
                        locationNew.FechaHora = "";
                        insert(
                            locationNew.Latitude,
                            locationNew.Longitude,
                            locationNew.FechaHora
                        );

                        console.log(
                            `Background Latitud ${loc.latitude} longitud ${
                                loc.longitude
                            } altura ${loc.altitude} velocidad ${
                                loc.speed > 5 ? 0 : loc.speed
                            }`
                        );
                    }
                },
                function(e) {
                    console.log(
                        "Background watch Location error: " + (e.message || e)
                    );
                },
                {
                    desiredAccuracy: Accuracy.high,
                    updateDistance: 0,
                    updateTime: 100,
                    minimumUpdateTime: 100,
                    iosAllowsBackgroundLocationUpdates: true,
                    iosPausesLocationUpdatesAutomatically: false,
                    iosOpenSettingsIfLocationHasBeenDenied: true
                }
            );
            console.log(watchId);
        },
        function(e) {
            console.log(
                "Background enableLocationRequest error: " + (e.message || e)
            );
        }
    );
}
application.on(application.exitEvent, _clearWatch);

export function getBackgroundServiceClass() {
    if (application.android) {
        if (device.sdkVersion < "26") {
            @JavaProxy("com.nativescript.location.BackgroundService")
            class BackgroundService extends (<any>android).app.Service {
                constructor() {
                    super();
                    return global.__native(this);
                }
                onStartCommand(intent, flags, startId) {
                    console.log("service onStartCommand");
                    this.super.onStartCommand(intent, flags, startId);
                    initDatabase();
                    return android.app.Service.START_STICKY;
                }
                onCreate() {
                    console.log("service onCreate");
                    if (device.sdkVersion >= "26") {
                        this.startForeground(1, new android.app.Notification());
                    }
                    let that = this;
                    _startWatch();
                }
                onBind(intent) {
                    console.log("service onBind");
                }
                onUnbind(intent) {
                    console.log("service onUnbind");
                }
                onDestroy() {
                    console.log("service onDestroy");
                    if (android.os.Build.VERSION.SDK_INT >= 26) {
                        this.stopForeground(true);
                    }
                    _clearWatch();
                }
            }
            return BackgroundService;
        } else {
            @JavaProxy("com.nativescript.location.BackgroundService26")
            class BackgroundService26 extends (<any>android.app).job
                .JobService {
                constructor() {
                    super();
                    return global.__native(this);
                }
                onStartJob(params) {
                    initDatabase();
                    let that = this;
                    let executed = false;
                    geolocation.enableLocationRequest().then(
                        function() {
                            watchId = geolocation.watchLocation(
                                function(loc) {
                                    if (loc) {
                                        let locationNew: LocationViewModel = new LocationViewModel();
                                        // let displayDate = _dateFormatPipe.transform(new Date()); //formatting current ///date here
                                        locationNew.Latitude = loc.latitude;
                                        locationNew.Longitude = loc.longitude;
                                        locationNew.FechaHora = "";
                                        insert(
                                            locationNew.Latitude,
                                            locationNew.Longitude,
                                            locationNew.FechaHora
                                        );
                                        // let toast = Toast.makeText(
                                        //     "B " +
                                        //         loc.longitude +
                                        //         " " +
                                        //         loc.latitude
                                        // );
                                        // toast.show();
                                        console.log(
                                            "B " +
                                                loc.longitude +
                                                "," +
                                                loc.latitude
                                        );
                                    }
                                    executed = true;
                                },
                                function(e) {
                                    console.log(
                                        "Background watchLocation error: " +
                                            (e.message || e)
                                    );
                                    executed = true;
                                },
                                {
                                    desiredAccuracy: Accuracy.high,
                                    updateDistance: 15,
                                    updateTime: 1000,
                                    iosAllowsBackgroundLocationUpdates: true,
                                    iosPausesLocationUpdatesAutomatically: false,
                                    iosOpenSettingsIfLocationHasBeenDenied: true
                                }
                            );
                        },
                        function(e) {
                            console.log(
                                "Background enableLocationRequest error: " +
                                    (e.message || e)
                            );
                        }
                    );
                    return executed;
                }
                onStopJob(jobParameters: any): boolean {
                    console.log("service onStopJob");
                    this.jobFinished(jobParameters, false);
                    _clearWatch();
                    return false;
                }
            }
            return BackgroundService26;
        }
    } else {
        return null;
    }
}
export const BackgroundServiceClass = getBackgroundServiceClass();
