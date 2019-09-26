import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { LoginComponent } from './login.component';
import { NativeScriptFormsModule } from "nativescript-angular/forms";


@NgModule({
  declarations: [LoginComponent],
  imports: [
    NativeScriptCommonModule,
    NativeScriptFormsModule
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class LoginModule { }
