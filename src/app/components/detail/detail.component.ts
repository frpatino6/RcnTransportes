import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Shedule } from "../../shared/model/shedule";
import * as dialogs from "tns-core-modules/ui/dialogs";
import * as geolocation from "nativescript-geolocation";
import { Accuracy } from "tns-core-modules/ui/enums"; // used to describe at what accuracy the location should be get

@Component({
    selector: "ns-detail-driver-service",
    templateUrl: "./detail.component.html",
    styleUrls: ["./detail.component.css"]
})
export class DetailDriverServiceComponent implements OnInit {
    public driversServices: Shedule;
    public showStop: boolean;
    public showPause: boolean;
    public showPlay: boolean;

    constructor(private route: ActivatedRoute) {}

    ngOnInit() {
        geolocation.enableLocationRequest();
        this.showStop = false;
        this.showPause = false;
        this.showPlay = true;
        let self = this;
        this.route.queryParams.subscribe(params => {
            self.driversServices = JSON.parse(params["selectedService"]);
            console.log(self.driversServices.descripcionRecorrido);
        });
    }
    onClickInitServices() {
        console.log("ssss");
        this.showConfirmAction();
    }

    showConfirmAction() {
        dialogs
            .confirm({
                title: "Transportes",
                message: "Desea iniciar el servicio",
                okButtonText: "Aceptar",
                cancelButtonText: "Cancelar"
            })
            .then(result => {
                // result argument is boolean
                if (result) {
                    this.showStop = true;
                    this.showPause = true;
                    this.showPlay = false;
                    // Get current location with high accuracy
                    geolocation.getCurrentLocation({
                        desiredAccuracy: Accuracy.high,
                        maximumAge: 5000,
                        timeout: 20000
                    });
                }
                console.log("Dialog result: " + result);
            });
    }
}
