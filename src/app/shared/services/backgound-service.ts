import * as geolocation from "nativescript-geolocation";
import { Accuracy } from "tns-core-modules/ui/enums";
import * as application from "tns-core-modules/application";
import { device } from "tns-core-modules/platform";
import * as Toast from "nativescript-toast";

const applicationModule = require("tns-core-modules/application");
let watchId;

function _clearWatch() {
    if (watchId) {
        geolocation.clearWatch(watchId);
        watchId = null;
    }
}

function _startWatch() {
    geolocation.enableLocationRequest().then(
        function() {
            _clearWatch();
            watchId = geolocation.watchLocation(
                function(loc) {
                    if (loc) {
                        let toast = Toast.makeText(
                            `Background Latitud  Latitud ${
                                loc.latitude
                            } longitud ${loc.longitude} altura ${
                                loc.altitude
                            } velocidad ${loc.speed > 5 ? 0 : loc.speed}`
                        );
                        toast.show();
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
                    updateDistance: 0.1,
                    updateTime: 1000,
                    iosAllowsBackgroundLocationUpdates: true,
                    iosPausesLocationUpdatesAutomatically: false,
                    iosOpenSettingsIfLocationHasBeenDenied: true
                }
            );
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
                    return android.app.Service.START_STICKY;
                }
                onCreate() {
                    console.log("service onCreate");
                    if (device.sdkVersion >= "26") {
                        this.startForeground(1, new android.app.Notification());
                    }
                    let that = this;
                    geolocation.enableLocationRequest().then(
                        function() {
                            that.id = geolocation.watchLocation(
                                function(loc) {
                                    if (loc) {
                                        let toast = Toast.makeText(
                                            `BACKGROUND Latitud ${
                                                loc.latitude
                                            } longitud ${
                                                loc.longitude
                                            } altura ${
                                                loc.altitude
                                            } velocidad ${
                                                loc.speed > 5 ? 0 : loc.speed
                                            }`
                                        );
                                        toast.show();
                                        console.log(
                                            ` BACKGROUND Latitud ${
                                                loc.latitude
                                            } longitud ${
                                                loc.longitude
                                            } altura ${
                                                loc.altitude
                                            } velocidad ${
                                                loc.speed > 5 ? 0 : loc.speed
                                            }`
                                        );
                                    }
                                },
                                function(e) {
                                    console.log(
                                        "BACKGROUND watchLocation error: " +
                                            (e.message || e)
                                    );
                                },
                                {
                                    desiredAccuracy: Accuracy.high,
                                    updateDistance: 10,
                                    updateTime: 5000,
                                    minimumUpdateTime: 100,
                                    iosAllowsBackgroundLocationUpdates: true,
                                    iosPausesLocationUpdatesAutomatically: false,
                                    iosOpenSettingsIfLocationHasBeenDenied: true
                                }
                            );
                        },
                        function(e) {
                            console.log(
                                "BACKGROUND enableLocationRequest error: " +
                                    (e.message || e)
                            );
                        }
                    );
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
                onStartJob(): boolean {
                    console.log("service onStartJob");
                    _startWatch();
                    return true;
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
