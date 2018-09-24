import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FacadeService } from './facade_service/facade.service';
import { Subscription } from 'rxjs';
import { CBottomSheetComponent } from './shared/c-bottom-sheet/c-bottom-sheet.component';
import { Router, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('bottomSheet') bottomSheet: CBottomSheetComponent;
  private subscriptions = new Subscription();
  public spinnerOn: boolean = false;
  title = 'Kapara Online';

  constructor(private facadeService: FacadeService,
    titleService: Title,
    router: Router) {
    this.facadeService.logInFirst();
    this.routerTitleHandler(router, titleService);
  };

  public routerTitleHandler(router, titleService) {
    this.subscriptions.add(
      router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          let title = this.getTitle(router.routerState, router.routerState.root).join('-');
          if (title == 'Login' && (this.facadeService.user !== null && this.facadeService.user !== undefined))
            title = 'Home';
          titleService.setTitle(this.title + ' | ' + title);
        };
      })
    );
  }

  getTitle(state, parent) {
    let data = [];
    if (parent && parent.snapshot.data && parent.snapshot.data.title) {
      data.push(parent.snapshot.data.title);
    };

    if (state && parent) {
      data.push(... this.getTitle(state, state.firstChild(parent)));
    };
    return data;
  };


  ngOnInit() {
    this.subscribeLoadingSpinner();
    this.subscribeBottomSheetMessages();
  };

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  };

  public subscribeLoadingSpinner() {
    this.subscriptions.add(
      this.facadeService.spinnerEmitter.subscribe(bool => this.spinnerOn = bool)
    );
  };

  public subscribeBottomSheetMessages() {
    setTimeout(() => this.bottomSheet.tellUserAboutCookies(), 5000);
    this.subscriptions.add(
      this.facadeService.bottomSheetsMessagesEmitter
        .subscribe(message => this.bottomSheet.releaseBottomSheetMessage(message))
    );
  };
};
