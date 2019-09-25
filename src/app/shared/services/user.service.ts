
// The following is a sample implementation of a backend service using Progress Kinvey (https://www.progress.com/kinvey).
// Feel free to swap in your own service / APIs / etc here for your own apps.
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { isAndroid, isIOS } from "tns-core-modules/platform"

// import { Kinvey } from "kinvey-nativescript-sdk";
import { User } from "../model/user.model";

@Injectable()
export class UserService {
  constructor(private http: HttpClient) { }

  private serverUrl = "https://solpe.rcntv.com.co/login/ValidateUser/";
  // private serverUrl = "http://192.168.0.5/solpe/login/ValidateUser/";
  register(user: User) {
    
  }

  login(user: User) {
    let header = this.createRequestHeader(user.password);
    // verifica plataforma
    let platform = "";
    if (isAndroid) {
      platform = "android"
    } else if (isIOS) {
      platform = "ios"
    }
   
    return this.http.get(this.serverUrl + user.email + '/empty/' + user.accessToken +  "/" + platform, { headers: header });
  }

  logout() {
    // return Kinvey.User.logout()
    //     .catch(this.handleErrors);
  }

  resetPassword(email) {
    // return Kinvey.User.resetPassword(email)
    //     .catch(this.handleErrors);
  }
  private createRequestHeader(password) {
    // set headers here e.g.
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, POST",
      'X-TFS-FedAuthRedirect': 'Suppress',
      'SolpePassword': password
    });

    return headers;
  }


}
