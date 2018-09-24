import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';

const jsonHeaders = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private base: string = 'users';

  constructor(private http: HttpClient) { }

  //cities local-api
  public getCitiesJSON(): Observable<any[]> {
    return this.http.get<any[]>('api/main-cities.json');
  };

  public registerNewUser(user: any): Observable<any> {
    return this.http.post(`${this.base}/register`, user, jsonHeaders).pipe(
      map(data => {
        /// will get user contains first name, role, cart ,_id , and email as username
        return data;
      }),
    )
  };

  public login(user: any): Observable<any> {
    return this.http.post(`${this.base}/login`, user, jsonHeaders);
  };

  public logoutFromUser(): Observable<any> {
    return this.http.get(`${this.base}/logout`);
  };

  public checkIDexistene(searchedID: string) {
    return this.http
      .get(`${this.base}/find`, {
        params: {
          id: searchedID
        }
      });
  }

  public checkEmailexistene(searchedEmail: string) {
    return this.http
      .get(`${this.base}/find`, {
        params: {
          email: searchedEmail
        }
      });
  };

  public checkIfHasSession(): Observable<any> {
    return this.http.get(`${this.base}/checkSession`);
  };
}
