import { Injectable } from '@angular/core';
import * as jwtdecode from 'jwt-decode';
import { of } from 'rxjs';
import {throwError} from 'rxjs';
import { Observable } from 'rxjs';

interface TokenData {
  username:string,
  mail:string,
  mod:boolean,
  id:string,
  validated:boolean
}

@Injectable()
export class UserService {

  constructor() { }

  //private token = '';
  private token = undefined;
  public url = '';

  login( mail: string, password: string): Observable<any> {
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

  registerMod( user ): Observable<any> {
    return throwError( { error: {errormessage: 'not implemented'}} );
  }

  edit( user ): Observable<any> {
    return throwError( { error: {errormessage: 'not implemented'}} );
  }

  logout() {
    this.token = undefined;
    localStorage.setItem('session_id', '');
    
  }

  set_token_from_storage(){
    this.token=localStorage.getItem('session_id')===''?undefined:localStorage.getItem('session_id')
  }

  get_token() {
    /*if(!this.token){
      this.token=localStorage.getItem("auction_website_token")
    }*/
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

  is_validated(): boolean {
    return (jwtdecode(this.token) as TokenData).validated;
  }

  is_moderator(): boolean {
    return (jwtdecode(this.token) as TokenData).mod;
  }

}
