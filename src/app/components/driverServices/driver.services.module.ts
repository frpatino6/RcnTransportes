import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { ListServicesDriverComponent } from './driver.services.component';
import { ListServicesDriverRoutingModule } from './driver.services.routing.module';
import { ListServicesByDriver } from '../../shared/services/list-services-driver.services';



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
