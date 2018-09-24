import { Routes } from "@angular/router";
import { NotFoundComponent } from "./views/not-found/not-found.component";

export class RootRoutes {
    static routes: Routes = [
        { path: '', redirectTo: 'home', pathMatch: 'full' },
        {path: 'store', redirectTo: 'store', pathMatch: 'full'},
        { path: '**', redirectTo: 'error-404' },
        { path: 'error-404', component: NotFoundComponent, data:{title: '404'} }
    ];
}