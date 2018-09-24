import { Component, OnInit, AfterContentInit } from '@angular/core';
import { FacadeService } from '../../../facade_service/facade.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit , AfterContentInit {

  constructor(private facadeService: FacadeService,
    private router: Router) { }

  ngOnInit() {

  };

  ngAfterContentInit(){
    this.facadeService.toggleSpinner(true);
    if (this.facadeService.isAuthenticated) {
      let user = this.facadeService.user;
      if (user.role == 'admin') {
        this.router.navigate(['store']);
      } else if (user.role == 'guest') {
        if (this.router.url != '/home/login') {
          this.router.navigate(['home/login']);
        };
      };
    };
    this.facadeService.toggleSpinner(false);
  };

}
