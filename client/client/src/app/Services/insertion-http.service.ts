import { Injectable } from '@angular/core';
import { Message } from '../Objects/Message';
import { Insertion } from '../Objects/Insertion';

import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { UserService } from './user.service';


@Injectable()
export class InsertionHttpService {

  private messages = [];

  constructor( private http: HttpClient, private us: UserService ) {
    console.log('Message service instantiated');
    console.log('User service token: ' + us.get_token() );
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

  private create_options( params = {} ) {
    return  {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.us.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      }),
      params: new HttpParams( {fromObject: params} )
    };

  }

  get_insertions(): Observable<Insertion[]> {
    return this.http.get<Insertion[]>( this.us.url + '/insertions').pipe(
        tap( (data) => console.log(JSON.stringify(data))) ,
        catchError( this.handleError )
      );
  }
/*
  post_message( m: Message ): Observable<Message> {
    console.log('Posting ' + JSON.stringify(m) );
    return this.http.post<Message>( this.us.url + '/messages', m,  this.create_options() ).pipe(
      catchError(this.handleError)
    );
  }
*/
}
