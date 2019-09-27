import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { ListServicesDriverComponent } from './list-services-driver.component';
import { ListServicesDriverRoutingModule } from './list-services-driver-routing.module';
import { ListServicesByDriver } from '../shared/services/listServicesByDriver.services';



@NgModule({
  declarations: [ListServicesDriverComponent],
  imports: [
    NativeScriptCommonModule,
    ListServicesDriverRoutingModule
  ],
  providers:[ListServicesByDriver],
  schemas: [NO_ERRORS_SCHEMA]
})
export class ListServicesDriverModule { }
