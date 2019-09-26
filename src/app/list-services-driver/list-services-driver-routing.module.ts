import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { ListServicesDriverComponent } from "./list-services-driver.component";

const routes: Routes = [
    { path: "", component: ListServicesDriverComponent }
];

@NgModule({
    imports: [NativeScriptRouterModule.forChild(routes)],
    exports: [NativeScriptRouterModule]
})
export class ListServicesDriverRoutingModule { }
