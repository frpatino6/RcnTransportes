import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ns-list-services-driver',
  templateUrl: './list-services-driver.component.html',
  styleUrls: ['./list-services-driver.component.css']
})
export class ListServicesDriverComponent implements OnInit {

  constructor() {

   }

  ngOnInit() {
    console.log('Init list');
  }

}
