// import { Observable } from "tns-core-modules/data/observable";
// import * as Toast from "nativescript-toast";
// import { BackgroundGeolocation } from "../../../geolocalization-background/api.android";
// import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";

// const ICONS = {
//     play: "ion-play",
//     pause: "ion-pause",
//     activity_unknown: "ion-ios-help",
//     activity_still: "ion-man",
//     activity_on_foot: "ion-android-walk",
//     activity_walking: "ion-android-walk",
//     activity_running: "ion-android-walk",
//     activity_in_vehicle: "ion-android-car",
//     activity_on_bicycle: "ion-android-bicycle"
// };

// export class BackGroundServicesPlattform extends Observable {
//     private _location: string;
//     public locationList = new ObservableArray();
//     private _counter: number;
//     private _message: string;
//     private _isMoving: boolean;
//     private _enabled: boolean;
//     private _paceButtonIcon: string;

//     constructor() {
//         super();

//         // First listen to desired events:
//         BackgroundGeolocation.on("location", location => {
//             //console.log("[event] location: ", location.coords.latitude);
//             if (location.coords != undefined){
//                 this.locationList.push(location.coords);
//                 let toast = Toast.makeText(
//                     `Latitud ${location.coords.latitude} longitud ${
//                         location.coords.longitude
//                     } altura ${location.coords.altitude} velocidad ${
//                         location.coords.speed > 5 ? 0 : location.coords.speed
//                     }`
//                 );
//                 toast.show();
//             }
                
//         });
//         BackgroundGeolocation.on(
//             "motionchange",
//             (isMoving: boolean, location: any) => {
//                 //console.log("[motionchange] -", isMoving, location);
//             }
//         );
//         BackgroundGeolocation.on("http", response => {
//             console.log("[http] -", response.status, response.responseText);
//         });
//         BackgroundGeolocation.on("providerchange", provider => {
//             console.log("[providerchange] -", provider);
//         });
//         BackgroundGeolocation.on("powersavechange", isPowerSaveMode => {
//             console.log("[powersavechange] -", isPowerSaveMode);
//         });
//         BackgroundGeolocation.on("schedule", state => {
//             console.log("[schedule] -", state.enabled);
//         });
//         BackgroundGeolocation.on("activitychange", event => {
//             console.log(
//                 "[eveactivitychangent] -",
//                 event.activity,
//                 event.confidence
//             );
//         });
//         BackgroundGeolocation.on("heartbeat", event => {
//             //console.log("[heartbeat] -", event.location.coords.latitude);

//             if (event.location.coords != undefined){
//                 this.locationList.push(event.location.coords);
//                 let toast = Toast.makeText(
//                     `Latitud ${event.location.coords.latitude} longitud ${
//                         event.location.coords.longitude
//                     } altura ${event.location.coords.altitude} velocidad ${
//                         event.location.coords.speed > 5 ? 0 : event.location.coords.speed
//                     }`
//                 );
//                 toast.show();
//             }
               
//         });
//         BackgroundGeolocation.on("geofence", geofence => {
//             //console.log("[geofence] -", geofence);
//         });
//         BackgroundGeolocation.on("geofenceschange", event => {
//             console.log(
//                 "[geofenceschange] - ON:",
//                 JSON.stringify(event.on),
//                 ", OFF:",
//                 JSON.stringify(event.off)
//             );
//         });
//         BackgroundGeolocation.on("connectivitychange", event => {
//             console.log("[connectivitychange] -", event);
//         });
//         BackgroundGeolocation.on("enabledchange", event => {
//             //console.log("[enabledchange] - ", event);
//         });
//         BackgroundGeolocation.getSensors(sensors => {
//             console.log("[getSensors] -", JSON.stringify(sensors, null, 2));
//         });
//         BackgroundGeolocation.isPowerSaveMode(mode => {
//             console.log("[isPowerSaveMode] -", mode);
//         });

//         // Now configure the plugin.
//         BackgroundGeolocation.ready(
//             {
//                 reset: true,
//                 debug: true,
//                 logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
//                 desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
//                 distanceFilter: 1,
//                 stopTimeout: 1,
//                 autoSync: true,
//                 stopOnTerminate: false,
//                 startOnBoot: true,
//                 foregroundService: true,
//                 heartbeatInterval: 1,
//                 username: "transistor-ns",
//                 enableHeadless: true
//             },
//             state => {
//                 console.log("[ready] success -", state);
//                 this.paceButtonIcon = state.isMoving ? ICONS.pause : ICONS.play;
//                 this.enabled = state.enabled;
//             },
//             (error: string) => {
//                 console.warn("[ready] FAILURE -", error);
//             }
//         );
//     }

//     set enabled(value: boolean) {
//         console.log("- setEnabled: ", value);
//         this.notifyPropertyChange("enabled", value);
//         this._enabled = value;
//         if (value) {
//             BackgroundGeolocation.start();
//         } else {
//             BackgroundGeolocation.stop();
//         }
//     }

//     get enabled(): boolean {
//         return this._enabled;
//     }

//     get paceButtonIcon(): string {
//         return this._paceButtonIcon;
//     }

//     set paceButtonIcon(value: string) {
//         if (this._paceButtonIcon !== value) {
//             this._paceButtonIcon = value;
//             this.notifyPropertyChange("paceButtonIcon", value);
//         }
//     }

//     // set location(location: any[]) {
//     //    // this.locationList = location;
//     //     this.notifyPropertyChange("location", this.locationList);
//     // }

//     // get location(): ObservableArray() {
//     //    // return this.locationList;
//     // }

//     public onChangePace() {
//         console.log("[changePace] -", this._isMoving);
//         this._isMoving = !this._isMoving;
//         this.paceButtonIcon = this._isMoving ? ICONS.pause : ICONS.play;
//         BackgroundGeolocation.changePace(this._isMoving);
//     }

//     public onGetCurrentPosition() {
//         BackgroundGeolocation.getCurrentPosition({
//             samples: 3,
//             persist: true
//         })
//             .then(location => {
//                 console.log("[getCurrentPosition] -", location);
//             })
//             .catch(error => {
//                 console.warn("[getCurrentPosition] ERROR -", error);
//             });
//     }
// }
