import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subscriber } from "rxjs";
import { Shedule } from "../model/shedule";
import { SheduleUpperCase } from "../model/sheduleUpperCase";

@Injectable()
export class ListServicesByDriver {
    constructor(private http: HttpClient) {}

    public dataDrivers: Shedule[] = new Array();
    // private serverUrl = "https://solpe.rcntv.com.co/login/ValidateUser/";
    // private serverUrl =
    //     "http://rcntviisdev/Intranet/GerenciaTI/API_Transportes/api/";
    private serverUrl = "http://192.168.0.7/Conductores/";

    public getListServicesByDriver(docNumber: String): Observable<SheduleUpperCase[]> {
        
        if (docNumber == undefined) docNumber = "1";
        let url: string =
            this.serverUrl + `ScheduleByDriver?NoDocumento=${docNumber}`;
        // console.log(url);
        //return this.http.get<Shedule[]>(url);
        // verifica plataforma
        console.log(url)
        return this.http.get<SheduleUpperCase[]>(url);
    }
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
}
