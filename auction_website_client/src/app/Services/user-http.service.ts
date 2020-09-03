import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as jwtdecode from 'jwt-decode';
import {User} from '../Objects/User'
import {ModStats, StudentStats} from '../Objects/UserStats'

interface TokenData {
  username:string,
  mail:string,
  mod:boolean,
  id:string,
  validated:boolean
}

@Injectable()
export class UserHttpService {

  constructor( private http: HttpClient ) {
    console.log('User service instantiated');

  }

  public token = undefined;
  public url = 'http://localhost:8080';
  

  public tokenExpired() {
    if(this.token){
      const expiry = (JSON.parse(atob(this.token.split('.')[1]))).exp;
      return (Math.floor((new Date).getTime() / 1000)) >= expiry;
    }
    return false
  }
  

  login( mail: string, password: string): Observable<any> {
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
        localStorage.setItem('session_id', this.token );
      }));
  }


  logout() {
    console.log('Logging out');
    this.token = undefined;
    localStorage.setItem('session_id', '');
  }


  register( user ): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };

    return this.http.post( this.url + '/users/students', user, options ).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data) );
      })
    );

  }


  registerMod( user ): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };

    return this.http.post( this.url + '/users/mods', user, options ).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data) );
      })
    );
  }


  edit( user ): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };

    return this.http.put( this.url + '/users', user, options ).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data) );
        this.token = data.token;
        localStorage.setItem('session_id', this.token );
      })
    );
  }


  delete_user(id : string): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };

    return this.http.delete( this.url + '/users/' + id, options ).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data) );
      })
    );
  }


  get_users() : Observable <User[]> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };

    return this.http.get<User[]>(this.url + '/users', options).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data) );
      })
    );
  }
  

  get_mod_stats(): Observable <ModStats> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };

    return this.http.get<ModStats>(this.url + '/users/stats', options).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data) );
      })
    );
  }


  get_student_stats(): Observable <StudentStats> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };

    return this.http.get<StudentStats>(this.url + '/users/stats', options).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data) );
      })
    );
  }
  

  set_token_from_storage(){
    this.token=localStorage.getItem('session_id')===''?undefined:localStorage.getItem('session_id')
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

  is_validated(): boolean {
    return (jwtdecode(this.token) as TokenData).validated;
  }

  is_moderator(): boolean {
    return (jwtdecode(this.token) as TokenData).mod;
  }
}
