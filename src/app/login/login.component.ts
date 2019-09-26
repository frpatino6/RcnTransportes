import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from "@angular/core";
import { alert, prompt } from "tns-core-modules/ui/dialogs";
import { Page } from "tns-core-modules/ui/page";
import { RouterExtensions } from "nativescript-angular/router";
import { User } from "../shared/model/user.model";
import { UserService } from "../shared/services/user.service";
import { ActivatedRoute, Router, NavigationStart } from "@angular/router";
import {
  LoadingIndicator,
  Mode,
  OptionsCommon
} from '@nstudio/nativescript-loading-indicator';

const indicator = new LoadingIndicator();

require("nativescript-localstorage");

@Component({
  selector: "app-login",
  moduleId: module.id,
  templateUrl: "./login.component.html",
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    indicator.hide();
  }
  private _message: string;
  private _token: String;
  private isLoggingIn = true;
  private user: User;
  @ViewChild("password",{static: true}) password: ElementRef;
  @ViewChild("confirmPassword",{static: true}) confirmPassword: ElementRef;

  constructor(private page: Page, private userService: UserService, private router: Router,
    private activeRoute: ActivatedRoute,
    private routerExtensions: RouterExtensions) {
    this.page.actionBarHidden = true;
    this.user = new User();
  
    this.user.email = ""; 
    this.user.password = ""; 
  }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        indicator.hide();
      }
    });
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
      return;
    }

    if (this.isLoggingIn) {
      this.login();
    } else {
      this.register();
    }
  }

  login() {   
    /*this.user.accessToken = this._token
    indicator.show({
      message: 'Verificando credenciales...',
      dimBackground: true,
      hideBezel: true,
      color: '#4B9ED6'

    });

    this.userService.login(this.user)   
      .subscribe((result) => {
        localStorage.setItem('emailUser', this.user.email);
        let navigationExtras = {
          queryParams: { 'email': this.user.email }
        }
        this.routerExtensions.navigate(["/listServices"], navigationExtras);
        indicator.hide();
      }, (error) => {              
        indicator.hide();
        this.showMessageDialog(error.message)
      });*/
      let navigationExtras = {
        queryParams: { 'email': this.user.email }
      }
      this.routerExtensions.navigate(["/listServices"], navigationExtras);
  }

  register() {
    if (this.user.password != this.user.confirmPassword) {
      this.message = "Your passwords do not match.";
      return;
    }
    this.userService.register(this.user)
    // .then(() => {
    //     this.processing = false;
    //     this.alert("Your account was successfully created.");
    //     this.isLoggingIn = true;
    // })
    // .catch(() => {
    //     this.processing = false;
    //     this.alert("Unfortunately we were unable to create your account.");
    // });
  }

  forgotPassword() {
    prompt({
      title: "Forgot Password",
      message: "Enter the email address you used to register for APP NAME to reset your password.",
      inputType: "email",
      defaultText: "",
      okButtonText: "Ok",
      cancelButtonText: "Cancel"
    }).then((data) => {
      if (data.result) {
        this.userService.resetPassword(data.text.trim())
        // .then(() => {
        //     this.alert("Your password was successfully reset. Please check your email for instructions on choosing a new password.");
        // }).catch(() => {
        //     this.alert("Unfortunately, an error occurred resetting your password.");
        // });
      }
    });
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
    var dialogs = require("tns-core-modules/ui/dialogs");
    dialogs.alert({
        title: "Solpe",
        message: message,
        okButtonText: "Aceptar"
    }).then(function () {
        console.log("Dialog closed!");
    });
  }
}

