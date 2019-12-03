import { Component, OnInit } from "@angular/core";
import { ListServicesByDriver } from "../../shared/services/list-services-driver.services";
import { registerElement } from "nativescript-angular/element-registry";
import { RouterExtensions } from "nativescript-angular/router";
import { ActivatedRoute } from "@angular/router";
import { Shedule } from "../../shared/model/shedule";
registerElement("PullToRefresh", () => {
    return require("@nstudio/nativescript-pulltorefresh").PullToRefresh;
});

@Component({
    selector: "ns-list-services-driver",
    templateUrl: "./driver.services.component.html",
    styleUrls: ["./driver.services.component.css"]
})
export class ListServicesDriverComponent implements OnInit {
    public dataDrivers: Shedule[] = new Array();
    public pullRefresh;
    public docNumber: String;

    constructor(
        private route: ActivatedRoute,
        private listServices: ListServicesByDriver,

        private routerExtensions: RouterExtensions
    ) {
        this.route.queryParams.subscribe(params => {
            this.docNumber = params["numDocumento"];
           // console.log("Parametros: " + params["numDocumento"]);
        });
    }

    ngOnInit() {
        this.getListSerrvicesByDriver();
    }

    refreshList(args) {
        this.pullRefresh = args.object;
        this.getListSerrvicesByDriver();
    }

    getListSerrvicesByDriver() {
        this.listServices.getListServicesByDriver(this.docNumber).subscribe(
            result => {
                this.dataDrivers = result.map(item => {
                    let itemDriver : Shedule = new Shedule();
                    itemDriver.id= item.Id;
                    itemDriver.solicitudNombre= item.SolicitudNombre;
                    itemDriver.fechaInicial= item.FechaInicial;
                    itemDriver.fechaFinal= item.FechaFinal;
                    itemDriver.nombreUsuarioSolicitante= item.NombreUsuarioSolicitante;
                    itemDriver.celularSolicitante= item.CelularSolicitante;
                    itemDriver.descripcionRecorrido= item.DescripcionRecorrido;
                    itemDriver.observaciones= item.Observaciones;
                    itemDriver.nombreTipoVehiculoProgramado= item.NombreTipoVehiculoProgramado;
                    itemDriver.nombreModalidadServicio= item.NombreModalidadServicio;
                    itemDriver.nombreProveedor= item.NombreProveedor;
                    itemDriver.placa= item.Placa;
                    itemDriver.nombreConductor= item.NombreConductor;
                    itemDriver.celularConductor= item.CelularConductor;

                    return itemDriver
                });
                this.pullRefresh.refreshing = false;             
            },
            error => {
                this.showMessageDialog(error.err);
            }
        );
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
               // console.log("Dialog closed!");
            });
    }
    onClickDetail(selectedService) {
       // console.log(`id servicio ${JSON.stringify(selectedService.id)}`);
        let navigationExtras = {
            queryParams: { selectedService: JSON.stringify(selectedService) }
        };
        this.routerExtensions.navigate(["/detailServices"], navigationExtras);
    }
}
