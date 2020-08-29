import { Injectable } from '@angular/core';
import { PrivateChat } from '../Objects/PrivateChat';

import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { Subject } from 'rxjs';

import { tap, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { UserHttpService } from './user-http.service';

@Injectable()

export class PrivateChatHttpService {


  private chatsStateSource = new Subject<any>();
  public chatsState = this.chatsStateSource.asObservable();

  constructor( private http: HttpClient, private uhs: UserHttpService ) {
    console.log('Private chat service instantiated');
    console.log('User service token: ' + uhs.get_token() );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        'body was: ' + JSON.stringify(error.error));
    }

    return throwError('Something bad happened; please try again later.');
  }
  

  get_chat(params: any): Observable<PrivateChat> {
      const options = {
        headers: new HttpHeaders({
          authorization: 'Bearer ' + this.uhs.get_token(),
          'cache-control': 'no-cache',
          'Content-Type':  'application/json',
        })
      };
      return this.http.get<PrivateChat>( this.uhs.url + '/private_chats/'+ params.id, options).pipe(
          tap( (data) => console.log(JSON.stringify(data))) ,
          catchError( this.handleError )
        );
  }

  get_chats(): Observable<PrivateChat[]> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.uhs.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };
    return this.http.get<PrivateChat[]>( this.uhs.url + '/private_chats', options).pipe(
        tap( (data) => console.log(JSON.stringify(data))) ,
        catchError( this.handleError )
      );
  }

  post_chat(message : string, insertion_id: string) : Observable <any> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.uhs.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };

    var body = {
      insertion_id: insertion_id,
      message: message
    }

    return this.http.post( this.uhs.url + '/private_chats', body, options ).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data) );
      })
    );
  }

  put_chat_read(id: string) : Observable <any> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.uhs.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };
    return this.http.put( this.uhs.url + '/private_chats/' + id + '/read', {}, options ).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data) );
      })
    );
  }

  put_chat_content(message : string, id : string) : Observable <any> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.uhs.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };
    return this.http.put( this.uhs.url + '/private_chats/' + id + '/message', {content : message}, options ).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data) );
      })
    );
  }

  get_unread_chats_count(): Observable<number> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.uhs.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };
    
    return this.http.get<number>( this.uhs.url + '/private_chats/unreadcount', options ).pipe(
      tap( (data) => {
        console.log(data);
      })
    );
  }

  set_chats_state_after_login() {
    this.chatsStateSource.next()
  }

/*
  private notificationsStateSource = new Subject<any>();
  public notificationsState = this.notificationsStateSource.asObservable();

  constructor(private http: HttpClient, private uhs: UserHttpService ) {
    console.log('Notification service instantiated');
    console.log('User service token: ' + uhs.get_token() );
  }

  set_notifications_state_after_login() {
    this.notificationsStateSource.next()
  }

  get_unread_notifications_count(): Observable<number> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.uhs.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };
    
    return this.http.get<number>( this.uhs.url + '/notifications/unreadcount', options ).pipe(
      tap( (data) => {
        console.log(data);
      })
    );
  }
*/

}