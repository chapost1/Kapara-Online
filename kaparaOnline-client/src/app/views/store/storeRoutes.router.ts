import { Routes } from "@angular/router";
import { StoreComponent } from "./store/store.component";
import { IsAuthenticatedGuard } from "../../guards/can-activates/is-authenticated.guard";
import { MakeSureHasUserGuard } from "../../guards/resolvers/make-sure-has-user.guard";
import { AdminHomePreventGuard } from "../../guards/can-deactivates/admin-home-prevent.guard";

export class StoreRoutes {
    static routes: Routes = [
        {
            path: 'store',
            component: StoreComponent,
            canDeactivate: [AdminHomePreventGuard],
            canActivate: [IsAuthenticatedGuard],
            resolve: { user: MakeSureHasUserGuard },
            data:{title: 'Store'} 
        },
    ]
}