import { Component, OnInit } from '@angular/core';
import { DriversServices } from '../shared/model/drivers.model';
import { ListServicesByDriver } from '../shared/services/listServicesByDriver.services';
import { registerElement } from "nativescript-angular/element-registry";
registerElement("PullToRefresh", () => require("@nstudio/nativescript-pulltorefresh").PullToRefresh);

@Component({
  selector: 'ns-list-services-driver',
  templateUrl: './list-services-driver.component.html',
  styleUrls: ['./list-services-driver.component.css']
})
export class ListServicesDriverComponent implements OnInit {
  public dataDrivers: DriversServices[] = new Array();
  public pullRefresh ;

  constructor(private listServices: ListServicesByDriver) {

  }

  ngOnInit() {
    this.getListSerrvicesByDriver(1);

  }

  refreshList(args) {
    this.pullRefresh = args.object
    this.getListSerrvicesByDriver(1);
}


  getListSerrvicesByDriver(driverId) {
   
    this.listServices.getListServicesByDriver(1)
      .subscribe((result) => {
        this.dataDrivers = result;
        this.pullRefresh.refreshing = false;
      }, (error) => {

      });
  }
  showMessageDialog(message) {
    let dialogs = require("tns-core-modules/ui/dialogs");
    dialogs.alert({
      title: "Solpe",
      message: message,
      okButtonText: "Aceptar"
    }).then(function () {
      console.log("Dialog closed!");
    });
  }
  onClickDetail(idServices) {
    this.showMessageDialog(String(idServices));
  }
}
