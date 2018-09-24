import { NgModule } from '@angular/core';
import { SharedModule } from "../../shared/shared.module";
import { RouterModule } from "@angular/router";
import { HomeRoutes } from "./homeRoutes.router";
import { MatStepperModule } from '@angular/material/stepper';

import { HomeComponent } from './home/home.component';
import { LoginPanelComponent } from './login-panel/login-panel.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { RegisterPanelComponent } from './register-panel/register-panel.component';

@NgModule({
  imports: [
    SharedModule,
    RouterModule,
    RouterModule.forChild(HomeRoutes.routes),
    MatStepperModule
  ],
  declarations: [
    HomeComponent,
    LoginPanelComponent,
    LoginFormComponent,
    RegisterPanelComponent
  ],
  exports:[
    SharedModule
  ]
})
export class HomeModule { }
