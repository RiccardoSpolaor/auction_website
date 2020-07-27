import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import * as jwtdecode from 'jwt-decode';



interface TokenData {
  username:string,
  mail:string,
  roles:string[],
  id:string
}

@Injectable()
export class UserHttpService {

  constructor( private http: HttpClient ) {
    console.log('User service instantiated');

  }

  public token = '';
  public url = 'http://localhost:8080';

  login( mail: string, password: string, remember: boolean ): Observable<any> {

    console.log('Login: ' + mail + ' ' + password );
    const options = {
      headers: new HttpHeaders({
        authorization: 'Basic ' + btoa( mail + ':' + password),
        'cache-control': 'no-cache',
        'Content-Type':  'application/x-www-form-urlencoded',
      })
    };

    return this.http.get( this.url + '/login',  options, ).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data));
        this.token = data.token;
        if ( remember ) {
          localStorage.setItem('postmessages_token', this.token );
        }
      }));
  }

  logout() {
    console.log('Logging out');
    this.token = '';
    localStorage.setItem('postmessages_token', this.token);
  }

  register( user ): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };

    return this.http.post( this.url + '/users', user, options ).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data) );
      })
    );

  }

  get_token() {
    return this.token;
  }

  get_username() {
    return (jwtdecode(this.token) as TokenData).username;
  }

  get_mail() {
    return (jwtdecode(this.token) as TokenData).mail;
  }

  get_id() {
    return (jwtdecode(this.token) as TokenData).id;
  }

  is_admin(): boolean {
    const roles = (jwtdecode(this.token) as TokenData).roles;
    for ( let idx = 0; idx < roles.length; ++idx ) {
      if ( roles[idx] === 'ADMIN' ) {
        return true;
      }
    }
    return false;
  }

  is_moderator(): boolean {
    const roles = (jwtdecode(this.token) as TokenData).roles;
    for ( let idx = 0; idx < roles.length; ++idx ) {
      if ( roles[idx] === 'MODERATOR' ) {
        return true;
      }
    }
    return false;
  }
}
