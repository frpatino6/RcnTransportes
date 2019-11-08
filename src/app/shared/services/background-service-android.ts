import * as geolocation from "nativescript-geolocation";
import * as Toast from "nativescript-toast";
import { Accuracy } from "tns-core-modules/ui/enums";
declare var com: any;

// @JavaProxy("com.nativescript.location.BackgroundService27")
// export class BackgroundService27 extends com.pip3r4o.android.app.IntentService {
//     protected onHandleIntent(intent: android.content.Intent): void {
//         geolocation.enableLocationRequest().then(
//             function () {
//                 this.watchId = geolocation.watchLocation(
//                     loc => {
//                         if (loc) {
//                             const toast = Toast.makeText(
//                                 "Background Location...: " +
//                                 loc.latitude +
//                                 " " +
//                                 loc.longitude
//                             );

//                             toast.show();

//                             console.log(
//                                 "Background Location...: " +
//                                 loc.latitude +
//                                 " " +
//                                 loc.longitude
//                             );
//                         }
//                     },

//                     e => {
//                         console.log(
//                             "Background watchLocation error: " +
//                             (e.message || e)
//                         );
//                     },

//                     {
//                         desiredAccuracy: Accuracy.high,
//                         updateDistance: 0.1,
//                         updateTime: 3000,
//                         minimumUpdateTime: 100
//                     }
//                 );
//             },
//             e => {
//                 console.log(
//                     "Background enableLocationRequest error: " +
//                     (e.message || e)
//                 );
//             }
//         );
//     }
// }
