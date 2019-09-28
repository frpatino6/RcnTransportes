import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

@Component({
    selector: "ns-detail-driver-service",
    templateUrl: "./detail-driver-service.component.html",
    styleUrls: ["./detail-driver-service.component.css"]
})
export class DetailDriverServiceComponent implements OnInit {
    public idServicio: any;
    constructor(private route: ActivatedRoute) {}

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.idServicio = params["idService"];
            console.log(this.idServicio);
        });

    }
}
