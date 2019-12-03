import {
    Component,
    ElementRef,
    ViewChild,
    OnInit,
    OnDestroy
} from "@angular/core";
import { alert, prompt } from "tns-core-modules/ui/dialogs";
import { Page, EventData } from "tns-core-modules/ui/page";
import { RouterExtensions } from "nativescript-angular/router";
import { User } from "../../shared/model/user.model";
import { UserService } from "../../shared/services/user.service";
import { ActivatedRoute, Router, NavigationStart } from "@angular/router";
import { messaging, Message } from "nativescript-plugin-firebase/messaging";
import {
    request,
    getFile,
    getImage,
    getJSON,
    getString
} from "tns-core-modules/http";
import {
    LoadingIndicator,
    Mode,
    OptionsCommon
} from "@nstudio/nativescript-loading-indicator";
const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};
const indicator = new LoadingIndicator();

require("nativescript-localstorage");

@Component({
    selector: "app-login",
    moduleId: module.id,
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit, OnDestroy {
    ngOnDestroy(): void {
        indicator.hide();
    }
    private _message: string;
    private _token: String;
    public isLoggingIn = true;
    public user: User;
    @ViewChild("password", { static: true }) password: ElementRef;
    @ViewChild("confirmPassword", { static: true }) confirmPassword: ElementRef;

    constructor(
        private page: Page,
        private userService: UserService,
        private router: Router,
        private activeRoute: ActivatedRoute,
        private routerExtensions: RouterExtensions
    ) {
        this.page.actionBarHidden = true;
        this.user = new User();

        this.user.email = "frodriguezp";
        this.user.password = "bogota1*";
    }

    ngOnInit(): void {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                indicator.hide();
            }
        });
    }
    public doRegisterPushHandlers(): void {
        // note that this will implicitly register for push notifications, so there's no need to call 'registerForPushNotifications'
        messaging.addOnPushTokenReceivedCallback(token => {
            // you can use this token to send to your own backend server,
            // so you can send notifications to this specific device
            console.log("Firebase plugin received a push token: " + token);
            this._token = token;
            // var pasteboard = utils.ios.getter(UIPasteboard, UIPasteboard.generalPasteboard);
            // pasteboard.setValueForPasteboardType(token, kUTTypePlainText);
        });
        messaging
            .addOnMessageReceivedCallback(message => {
                console.log(
                    "Push message received in push-view-model: " +
                        JSON.stringify(message, getCircularReplacer())
                );

                setTimeout(() => {
                    alert({
                        title: "Push message!",
                        message:
                            message !== undefined && message.title !== undefined
                                ? message.title
                                : "",
                        okButtonText: "Sw33t"
                    });
                }, 500);
            })
            .then(
                () => {
                    console.log("Added addOnMessageReceivedCallback");
                },
                err => {
                    console.log(
                        "Failed to add addOnMessageReceivedCallback: " + err
                    );
                }
            );
    }

    public doGetCurrentPushToken(): void {
        messaging
            .getCurrentPushToken()
            .then(token => {
                console.log(`Current push token: ${token}`);
                this._token = token;
                // alert({
                //   title: "Current Push Token",
                //   message: (!token ? "Not received yet (note that on iOS this does not work on a simulator)" : token + ("\n\nSee the console log if you want to copy-paste it.")),
                //   okButtonText: "OK, thx"
                // });
            })
            .catch(err =>
                console.log("Error in doGetCurrentPushToken: " + err)
            );
    }

    public doRegisterForPushNotifications(): void {
        messaging
            .registerForPushNotifications({
                onPushTokenReceivedCallback: (token: string): void => {
                    console.log(
                        ">>>> Firebase plugin received a push token: " + token
                    );
                },

                onMessageReceivedCallback: (message: Message) => {
                    console.log(
                        "Push message received in push-view-model: " +
                            JSON.stringify(message, getCircularReplacer())
                    );

                    setTimeout(() => {
                        alert({
                            title: "Push message!",
                            message:
                                message !== undefined &&
                                message.title !== undefined
                                    ? message.title
                                    : "",
                            okButtonText: "Sw33t"
                        });
                    }, 500);
                },

                // Whether you want this plugin to automatically display the notifications or just notify the callback. Currently used on iOS only. Default true.
                showNotifications: true,

                // Whether you want this plugin to always handle the notifications when the app is in foreground.
                // Currently used on iOS only. Default false.
                // When false, you can still force showing it when the app is in the foreground by adding 'showWhenInForeground' to the notification as mentioned in the readme.
                showNotificationsWhenInForeground: false
            })
            .then(() => console.log(">>>> Registered for push"))
            .catch(err => console.log(">>>> Failed to register for push"));
    }
    get message(): string {
        return this._message;
    }

    set message(value: string) {
        if (this._message !== value) {
            this._message = value;
            // this.notifyPropertyChange("message", value);
        }
    }

    private updateMessage(text: String) {
        this.message += text + "\n";
        alert(this.message);
    }
    toggleForm() {
        this.isLoggingIn = !this.isLoggingIn;
    }

    submit() {
        if (!this.user.email || !this.user.password) {
            this.message = "Please provide both an email address and password.";
            this.showMessageDialog(
                "Ingrese el nombre de usuario y contraseña."
            );

            return;
        }

        if (this.isLoggingIn) {
            this.login();
        }
    }

    login() {
        this.user.accessToken = this._token;
        indicator.show({
            message: "Verificando credenciales...",
            dimBackground: true,
            hideBezel: true,
            color: "#4B9ED6"
        });

        let resLogin: any;
        let self = this;
        this.userService.login(self.user).subscribe(
            result => {
                resLogin = result;
                localStorage.setItem("emailUser", self.user.email);
                let navigationExtras = {
                    queryParams: {
                        email: self.user.email,
                        numDocumento: result.Numero_Documento
                    }
                };
                console.log(result);

                if (!resLogin.Authenticated) {
                    this.showMessageDialog("Usuario o contraseña no válido");
                    indicator.hide();
                    return;
                }
                if (!resLogin.Authorized) {
                    this.showMessageDialog(
                        "No tiene autorización para el ingreso"
                    );
                    indicator.hide();
                    return;
                }
                this.routerExtensions.navigate(
                    ["/listServices"],
                    navigationExtras
                );
                indicator.hide();
            },
            error => {
                indicator.hide();
                this.showMessageDialog(error.message);
                console.log(error);
            }
        );
    }

    focusPassword() {
        this.password.nativeElement.focus();
    }
    focusConfirmPassword() {
        if (!this.isLoggingIn) {
            this.confirmPassword.nativeElement.focus();
        }
    }

    get messages(): string {
        return this._message;
    }

    set messages(value: string) {
        if (this._message !== value) {
            this._message = value;
        }
    }
    showMessageDialog(message) {
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

    onBlur($event: EventData) {
        console.log("on blur", $event.eventName);
    }

    returnPress($event: EventData) {
        console.log("returnPress", $event.eventName);
    }

    onTextChange($event: EventData) {
        console.log("onTextChange", $event.eventName);
    }

    onFocus($event: EventData) {
        console.log("onFocus", $event.eventName);
    }
}
