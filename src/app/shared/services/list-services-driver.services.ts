import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subscriber } from 'rxjs';
import { Shedule } from "../model/shedule";

@Injectable()
export class ListServicesByDriver {
    constructor(private http: HttpClient) { }

    public dataDrivers: Shedule[] = new Array();
     // private serverUrl = "https://solpe.rcntv.com.co/login/ValidateUser/";
    //   private serverUrl = "http://rcntviisdes/Intranet/GerenciaTI/API_Transportes/api/";
    private serverUrl = "http://192.168.0.6/Conductores/";

    public getListServicesByDriver(docNumber: String): Observable<Shedule[]> {
        
        let url: string = this.serverUrl+ `ScheduleByDriver?NoDocumento=${docNumber}`;
        console.log(url);
        //return this.http.get<Shedule[]>(url);
        // verifica plataforma            
        return this.http.get<Shedule[]>(
            "http://192.168.0.6/Conductores/ScheduleByDriver/" + docNumber
        );
      
    }

    private createRequestHeader() {
    
        let headers = new HttpHeaders({
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, PUT, POST",
            'X-TFS-FedAuthRedirect': 'Suppress'
        });

        return headers;
    }
   

}