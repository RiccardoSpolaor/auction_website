import { Injectable } from '@angular/core';
import * as jwtdecode from 'jwt-decode';
import { of } from 'rxjs';
import {throwError} from 'rxjs';
import { Observable } from 'rxjs';

interface TokenData {
  username:string,
  mail:string,
  roles:string[],
  id:string
}

@Injectable()
export class UserService {

  constructor() { }

  private token = '';
  public url = '';

  login( mail: string, password: string, remember: boolean ): Observable<any> {
    console.log('Login: ' + mail + ' ' + password );

    // tslint:disable-next-line:max-line-length
    this.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZXMiOlsiQURNSU4iLCJNT0RFUkFUT1IiXSwibWFpbCI6ImFkbWluQHBvc3RtZXNzYWdlcy5pdCIsImlkIjoiNWFjNGRkYzcxMWUwMzYwYmEyZGYzZjQ4IiwiaWF0IjoxNTIyODU2MjU3LCJleHAiOjE1MjI4NTk4NTd9.3p6TmJAMqL19h4-b_r2pBdyerdbHh_l3zA87ZTfqeYk';
    return of( {} );
  }

  renew(): Observable<any> {
    return throwError( 'not implemented' );
  }

  register( user ): Observable<any> {
    return throwError( { error: {errormessage: 'not implemented'}} );
  }

  logout() {
    this.token = '';
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
