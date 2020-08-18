import { Injectable } from '@angular/core';
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
    console.log('Insertion service instantiated');
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
  

  get_insertion(params: any): Observable<Insertion> {
    if(this.us.get_token()){
      const options = {
        headers: new HttpHeaders({
          authorization: 'Bearer ' + this.us.get_token(),
          'cache-control': 'no-cache',
          'Content-Type':  'application/json',
        })
      };
      return this.http.get<Insertion>( this.us.url + '/insertions/'+ params.id, options).pipe(
          tap( (data) => console.log(JSON.stringify(data))) ,
          catchError( this.handleError )
        );
    }else{
      return this.http.get<Insertion>( this.us.url + '/insertions/'+ params.id).pipe(
        tap( (data) => console.log(JSON.stringify(data))) ,
        catchError( this.handleError )
      );
    }
  }

  get_insertions(params?: any): Observable<Insertion[]> {
    return this.http.get<Insertion[]>( this.us.url + '/insertions', {params: params}).pipe(
        tap( (data) => console.log(JSON.stringify(data))) ,
        catchError( this.handleError )
      );
  }

  post_insertion(insertion : any) : Observable <any> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.us.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };

    return this.http.post( this.us.url + '/insertions', insertion, options ).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data) );
      })
    );
  }

  put_price(params: any, price: number):Observable<any> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.us.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };

    return this.http.put( this.us.url + '/insertions/'+ params.id + '/price', {current_price: price}, options ).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data) );
      })
    );
  }


  put_message( params: any, m: any ): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.us.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };
    console.log('Posting ' + JSON.stringify(m) );

    if (params.m_id) {
      return this.http.put( this.us.url + '/insertions/' + params.id + '/public_messages/' + params.m_id, {content: m},  options ).pipe(
        catchError(this.handleError)
      );
    }else {
      return this.http.put( this.us.url + '/insertions/' + params.id + '/public_messages', {content: m},  options ).pipe(
        catchError(this.handleError)
      );
    }
  }

  delete_insertion( params: any ): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.us.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };
    console.log('Deleting Insertion ' + JSON.stringify(params.id) );

    return this.http.delete( this.us.url + '/insertions/' + params.id, options ).pipe(
      catchError(this.handleError)
    );
  }

}
