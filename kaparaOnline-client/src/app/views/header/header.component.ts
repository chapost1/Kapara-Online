import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserModel } from '../../models/user.model';
import { Subscription } from "rxjs";
import { FacadeService } from '../../facade_service/facade.service';
import { UsersService } from '../home/services/users.service';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  public user: UserModel;
  public isCollapsed = true;
  public searchValue: string = '';
  private subscriptions = new Subscription();

  constructor(public facadeService: FacadeService,
    public usersService: UsersService,
    public router: Router) { }

  ngOnInit() {
    this.subscribeFacadeUserEvents();
    this.subscribeRouteEvents();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  };

  public subscribeRouteEvents() {
    this.subscriptions.add(
      this.router.events.subscribe((event: NavigationStart | NavigationEnd) => {
        if ((event instanceof NavigationEnd)) {
          this.facadeService.handleUserEmitters(this.user);
          if (!(this.router.url.startsWith('/store')) &&
            this.searchValue.length > 0) {
            this.searchValue = '';
          };
        };
      })
    );
  };

  public checkUserAndIfStore(): boolean {
    if (this.router.url == '/store')
      return true;
    else
      return false;
  };

  public subscribeFacadeUserEvents() {
    this.subscriptions.add(
      this.facadeService.headerUserEmitter.subscribe(user => {
        this.user = user;
      })
    );
  };

  public logoutUser() {
    this.subscriptions.add(
      this.usersService.logoutFromUser().subscribe(res => {
        this.facadeService.openSnackBar("You have been logged out successfully", 'success');
        this.facadeService.logOut();
      }, err => this.facadeService.openSnackBar("Couldn't communicate server", 'alert'))
    );
  };

  public handleSearch(searchValue: string) {
    this.facadeService.handleSearchViaHeader(searchValue);
  };
}
