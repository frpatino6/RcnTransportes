import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { DetailDriverServiceService } from '../../shared/services/detail-driver-service.service';
import { DetailDriverServiceComponent } from './detail.component';
import { DetailDriverRoutingModule } from './detail.routing.module';

@NgModule({
  declarations: [DetailDriverServiceComponent],
  imports: [
    NativeScriptCommonModule,
    DetailDriverRoutingModule
  ],
  schemas: [NO_ERRORS_SCHEMA],
  providers:[DetailDriverServiceService]
})
export class DetailDriverServiceModule { }
