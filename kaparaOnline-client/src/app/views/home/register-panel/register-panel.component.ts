import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { Subscription, Observable } from 'rxjs';
import { FacadeService } from '../../../facade_service/facade.service';
import { UserModel } from '../../../models/user.model';

@Component({
  selector: 'app-register-panel',
  templateUrl: './register-panel.component.html',
  styleUrls: ['./register-panel.component.css']
})
export class RegisterPanelComponent implements OnInit, OnDestroy {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  private subscriptions = new Subscription();
  public cities: any[] = [];

  constructor(private _formBuilder: FormBuilder,
    public facadeService: FacadeService,
    private router: Router,
    public userService: UsersService) { }

  ngOnInit() {
    this.facadeService.toggleSpinner(true);
    this.getCitiesOpt();
    //
    this.firstFormGroup = this._formBuilder.group({
      id: ['',
        [
          Validators.required,
          Validators.pattern(/^\d+$/),
          Validators.minLength(9)
        ],
        this.checkID
      ],
      username: ['',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i)
        ],
        this.checkEmail
      ],
      password: ['',
        [
          Validators.required
        ]
      ],
      password2: ['',
        [
          Validators.required
        ]
      ],
    },
      {
        validator: this.checkIfMatchingPasswords('password', 'password2')
      });
    this.secondFormGroup = this._formBuilder.group({
      city: ['',
        Validators.required
      ],
      address: ['',
        Validators.required
      ],
      first: ['',
        Validators.required
      ],
      last: ['',
        Validators.required
      ]
    });
    this.facadeService.toggleSpinner(false);
  };

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  };

  public getCitiesOpt() {
    this.subscriptions.add(this.userService.getCitiesJSON().subscribe(citiesJSON => { this.cities = citiesJSON; }));
  };

  public alreadyUser() {
    this.router.navigate(['home/login']);
  };

  public checkID = (control: AbstractControl): Observable<any> => {
    let id = control.value;
    if (id.length >= 9) {
      return this.userService.checkIDexistene(id);
    } else {
      return null;
    };
  };

  public checkEmail = (control: AbstractControl): Observable<any> => {
    return this.userService.checkEmailexistene(control.value);
  };

  public checkIfMatchingPasswords(passwordKey: string, passwordConfirmationKey: string) {
    return (group: FormGroup) => {
      let passwordInput = group.controls[passwordKey],
        passwordConfirmationInput = group.controls[passwordConfirmationKey];
      if (passwordInput.value !== passwordConfirmationInput.value) {
        return passwordConfirmationInput.setErrors({ hasError: 'Passwords are not a match' })
      }
      else {
        return passwordConfirmationInput.setErrors(null);
      }
    }
  };

  public sendNewUser() {
    if (this.firstFormGroup.valid && this.secondFormGroup.valid) {
      let personal = this.secondFormGroup.value;
      let login = this.firstFormGroup.value;
      let newUser = new UserModel(login.id, personal.first, personal.last, login.username, personal.city,
        personal.address, 'guest',undefined,undefined,login.password);
      this.subscriptions.add(
        this.userService.registerNewUser(newUser).subscribe(result => {
          if (result.hasOwnProperty('hasError')) {
            //error
            this.facadeService.openSnackBar(result.hasError, 'alert');
          } else {
            /// everything went ok
            this.facadeService.openSnackBar(`Hi ${result.first}!`, 'success');
            this.facadeService.assignNewUser(result);
            this.router.navigate(['home/login']);
          };
        }, err => this.facadeService.openSnackBar("couldn't communicate server", 'alert'))
      );
    };
  };

}
