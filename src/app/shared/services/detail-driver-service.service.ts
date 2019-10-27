import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

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
}
