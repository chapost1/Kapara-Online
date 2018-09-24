import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HomeModule } from "./views/home/home.module";
import { StoreModule } from "./views/store/store.module";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { RootRoutes } from "./rootRoutes.router";
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { HeaderComponent } from './views/header/header.component';
import { NotFoundComponent } from './views/not-found/not-found.component';
import { SpinnerComponent } from './views/spinner/spinner.component';
import { CBottomSheetComponent } from './shared/c-bottom-sheet/c-bottom-sheet.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NotFoundComponent,
    SpinnerComponent,
    CBottomSheetComponent
  ],
  imports: [
    BrowserModule,
    HomeModule,
    StoreModule,
    HttpClientModule,
    RouterModule.forRoot(RootRoutes.routes),
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
