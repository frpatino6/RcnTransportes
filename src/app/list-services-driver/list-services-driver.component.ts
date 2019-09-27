import { Component, OnInit } from '@angular/core';
import { Drivers } from '../shared/model/drivers.model';
import { ListServicesByDriver } from '../shared/services/listServicesByDriver.services';

@Component({
  selector: 'ns-list-services-driver',
  templateUrl: './list-services-driver.component.html',
  styleUrls: ['./list-services-driver.component.css']
})
export class ListServicesDriverComponent implements OnInit {
  public dataDrivers: Drivers[] = new Array();
  constructor(private listServices: ListServicesByDriver) {

  }

  ngOnInit() {
    this.getListSerrvicesByDriver(1);

  }
  getListSerrvicesByDriver(driverId) {
    var selft = this;
    this.listServices.getListServicesByDriver(1)
      .subscribe((result) => {
        selft.dataDrivers = result;
      }, (error) => {

      });
  }
  showMessageDialog(message) {
    var dialogs = require("tns-core-modules/ui/dialogs");
    dialogs.alert({
        title: "Solpe",
        message: message,
        okButtonText: "Aceptar"
    }).then(function () {
        console.log("Dialog closed!");
    });
}
}
