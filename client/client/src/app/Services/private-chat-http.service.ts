import { Injectable } from '@angular/core';
import { PrivateChat } from '../Objects/PrivateChat';

import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { UserHttpService } from './user-http.service';

@Injectable()

export class PrivateChatHttpService {


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

}