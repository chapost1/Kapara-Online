import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { UserModel } from '../../../models/user.model';
import { FacadeService } from '../../../facade_service/facade.service';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { UsersService } from '../services/users.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit, OnDestroy {
  @ViewChild('myNgLoginForm') myNgLoginForm: NgForm;
  @Input() user: UserModel;
  public loginFormGroup: FormGroup;
  private subscription = new Subscription();
  public waitSpinnerLogin: boolean = false;

  constructor(private _formBuilder: FormBuilder,
    public facadeService: FacadeService,
    public usersService: UsersService,
    public router: Router) {
    this.initLoginFormGroup();
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public initLoginFormGroup() {
    this.loginFormGroup = this._formBuilder.group({
      username: ['',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i)
        ]
      ],
      password: ['',
        [
          Validators.required
        ]
      ],
    });
  };

  public tryToLogin() {
    if (this.loginFormGroup.valid) {
      this.waitSpinnerLogin = true;
      this.subscription.add(
        this.usersService.login(this.loginFormGroup.value).subscribe(response => {
          if (response.hasOwnProperty('hasError')) {
            this.facadeService.openSnackBar(response.hasError, 'alert');
          } else {
            //response = user
            this.myNgLoginForm.resetForm();
            this.facadeService.openSnackBar(`Hi ${response.first}!`, 'success');
            this.facadeService.assignNewUser(response);
            if (response.role == 'admin') {
              this.router.navigate(['store']);
            };
          };
          setTimeout(() => this.waitSpinnerLogin = false, 0);
        }, err => {
          setTimeout(() => this.waitSpinnerLogin = false, 0);
          this.facadeService.openSnackBar(`Couldn't log in, please try again later.`, 'alert')
        })
      );
    };
  };

}
