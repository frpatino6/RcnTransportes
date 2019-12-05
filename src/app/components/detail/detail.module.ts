import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { DetailDriverServiceService } from '../../shared/services/detail-driver-service.service';
import { DetailDriverServiceComponent } from './detail.component';
import { DetailDriverRoutingModule } from './detail.routing.module';
import { DateFormatPipe } from '~/app/shared/pipes/date-format-pipe';

@NgModule({
  declarations: [DetailDriverServiceComponent,DateFormatPipe],
  imports: [
    NativeScriptCommonModule,
    DetailDriverRoutingModule
  ],
  schemas: [NO_ERRORS_SCHEMA],
  providers:[DetailDriverServiceService,DateFormatPipe],
  exports : [DateFormatPipe]
})
export class DetailDriverServiceModule { }
