import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Shedule } from "../model/shedule";
import { Observable, Subscriber } from "rxjs";
@Injectable({
    providedIn: "root"
})
export class DetailDriverServiceService {
    constructor(private http: HttpClient) {}
    private createRequestHeader() {
        let headers = new HttpHeaders({
            "Content-Type": "application/json",
            Accept: "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, PUT, POST",
            "X-TFS-FedAuthRedirect": "Suppress"
        });

        return headers;
    }
    public dataDrivers: Shedule[] = new Array();
    // private serverUrl = "https://solpe.rcntv.com.co/login/ValidateUser/";
    //   private serverUrl = "http://rcntviisdes/Intranet/GerenciaTI/API_Transportes/api/";
    private serverUrl = "http://192.168.0.7/Conductores/";

    public getListServicesByDriverDetail(id: Number): Observable<Shedule> {
        let url: string = this.serverUrl + `ScheduleByDriverDet/${id}`;
        // console.log(url);
        return this.http.get<Shedule>(url);
    }
    public getListPauseReasons(): Observable<any> {
        let url: string = this.serverUrl + `lstPause/`;
        // console.log(url);
        return this.http.get<any>(url);
    }
    public sendGeoLocalization(parameters): Observable<any> {
        let url: string = this.serverUrl + `SaveGPS?id=5`;
        // console.log(url);
        return this.http.post<any>(url, parameters);
    }
}
