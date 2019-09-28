
// The following is a sample implementation of a backend service using Progress Kinvey (https://www.progress.com/kinvey).
// Feel free to swap in your own service / APIs / etc here for your own apps.
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subscriber } from 'rxjs';

// import { Kinvey } from "kinvey-nativescript-sdk";
import { User } from "../model/user.model";
import { DriversServices } from "../model/drivers.model";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";

@Injectable()
export class ListServicesByDriver {
    constructor(private http: HttpClient) { }
    public dataDrivers: DriversServices[] = new Array();
    //private serverUrl = "https://solpe.rcntv.com.co/login/ValidateUser/";
    private serverUrl = "http://192.168.0.12/solpe/login/ValidateUser/";

    public getListServicesByDriver(driverId: Number): Observable<DriversServices[]> {
        let headers = this.createRequestHeader();
        this.dataDrivers = [];
        console.log(this.serverUrl + driverId);
        this.populateListDrivers();
        return Observable.create((observer: Subscriber<any>) => {
            observer.next(this.dataDrivers);
            observer.complete();
        });
    }

    private createRequestHeader() {
        // set headers here e.g.
        let headers = new HttpHeaders({
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, PUT, POST",
            'X-TFS-FedAuthRedirect': 'Suppress'
        });

        return headers;
    }
    populateListDrivers() {
        let item1: DriversServices = new DriversServices();
        item1.id = 1548777;
        item1.date = "24/09/2019";
        item1.time = "08:00:00";
        item1.phone = "31547895414";
        item1.phone = "John Alexander";
        this.dataDrivers.push(item1);

        let item2: DriversServices = new DriversServices();
        item2.id = 354874;
        item2.date = "25/09/2019";
        item2.time = "15:00:00";
        item2.phone = "31547895414";
        item2.phone = "John Alexander";
        this.dataDrivers.push(item2);

        let item3: DriversServices = new DriversServices();
        item3.id = 584111;
        item3.date = "25/09/2019";
        item3.time = "20:00:00";
        item3.phone = "31547895414";
        item3.phone = "John Alexander";
        this.dataDrivers.push(item3);

        let item4: DriversServices = new DriversServices();
        item4.id = 135478;
        item4.date = "26/09/2019";
        item4.time = "06:00:00";
        item4.phone = "31547895414";
        item4.phone = "John Alexander";
        this.dataDrivers.push(item4);

        let item5: DriversServices = new DriversServices();
        item5.id = 145888;
        item5.date = "27/09/2019";
        item5.time = "09:00:00";
        item5.phone = "31547895414";
        item5.phone = "John Alexander";
        this.dataDrivers.push(item5);



    }

}
