import { Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { RegisterPanelComponent } from "./register-panel/register-panel.component";
import { LoginPanelComponent } from "./login-panel/login-panel.component";
import { PreventRegisterGuard } from "../../guards/can-activates/prevent-register.guard";
import { MakeSureHasUserGuard } from "../../guards/resolvers/make-sure-has-user.guard";

export class HomeRoutes {
    static routes: Routes = [
        {
            path: 'home', component: HomeComponent,
            children: [
                { path: '', redirectTo: 'login', pathMatch: 'full' },
                {
                    path: 'register', component: RegisterPanelComponent,
                    canActivate: [PreventRegisterGuard],
                    data:{title: 'Register'} 
                },
                {
                    path: 'login', component: LoginPanelComponent,
                    resolve: { user: MakeSureHasUserGuard },
                    data:{title: 'Login'} 
                }
            ],
        },
    ]
}