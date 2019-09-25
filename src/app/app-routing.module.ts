import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { BackendService } from "./shared/services/backendService";
import { LoginComponent } from "./login/login.component";

const routes: Routes = [
    { path: "", redirectTo: BackendService.isUserLoggedIn() ? "/home" : "/login", pathMatch: "full" },
    { path: "login", component: LoginComponent },
    { path: "home", loadChildren: () => import("~/app/home/home.module").then((m) => m.HomeModule) }
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }
