import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { ListServicesDriverComponent } from './list-services-driver.component';
import { ListServicesDriverRoutingModule } from './list-services-driver-routing.module';



@NgModule({
  declarations: [ListServicesDriverComponent],
  imports: [
    NativeScriptCommonModule,
    ListServicesDriverRoutingModule
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class ListServicesDriverModule { }
