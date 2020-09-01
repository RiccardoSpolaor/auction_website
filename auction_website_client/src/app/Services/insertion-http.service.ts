import { Injectable } from '@angular/core';
import { Insertion } from '../Objects/Insertion';

import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { UserHttpService } from './user-http.service';


@Injectable()
export class InsertionHttpService {

  constructor( private http: HttpClient, private uhs: UserHttpService ) {
    console.log('Insertion service instantiated');
    console.log('User service token: ' + uhs.get_token() );
}


  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        'body was: ' + JSON.stringify(error.error));
    }

    return throwError('Something bad happened; please try again later.');
  }
  

  get_insertion(params: any): Observable<Insertion> {
    if(this.uhs.get_token()){
      const options = {
        headers: new HttpHeaders({
          authorization: 'Bearer ' + this.uhs.get_token(),
          'cache-control': 'no-cache',
          'Content-Type':  'application/json',
        })
      };
      return this.http.get<Insertion>( this.uhs.url + '/insertions/'+ params.id, options).pipe(
          tap( (data) => console.log(JSON.stringify(data))) ,
          catchError( this.handleError )
        );
    }else{
      return this.http.get<Insertion>( this.uhs.url + '/insertions/'+ params.id).pipe(
        tap( (data) => console.log(JSON.stringify(data))) ,
        catchError( this.handleError )
      );
    }
  }
  

  get_insertions(params?: any): Observable<Insertion[]> {
    return this.http.get<Insertion[]>( this.uhs.url + '/insertions', {params: params}).pipe(
        tap( (data) => console.log(JSON.stringify(data))) ,
        catchError( this.handleError )
      );
  }


  post_insertion(insertion : any) : Observable <any> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.uhs.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };

    return this.http.post( this.uhs.url + '/insertions', insertion, options ).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data) );
      })
    );
  }


  put_price(params: any, price: number):Observable<any> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.uhs.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };

    return this.http.put( this.uhs.url + '/insertions/'+ params.id + '/price', {current_price: price}, options ).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data) );
      })
    );
  }


  put_message( params: any, m: any ): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.uhs.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };
    console.log('Posting ' + JSON.stringify(m) );

    if (params.m_id) {
      return this.http.put( this.uhs.url + '/insertions/' + params.id + '/public_messages/' + params.m_id, {content: m},  options ).pipe(
        catchError(this.handleError)
      );
    }else {
      return this.http.put( this.uhs.url + '/insertions/' + params.id + '/public_messages', {content: m},  options ).pipe(
        catchError(this.handleError)
      );
    }
  }


  edit_insertion (params: any, insertion: any ): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.uhs.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };
    console.log('Editing Insertion ' + params.id );
    
    return this.http.put( this.uhs.url + '/insertions/' + params.id + '/content', insertion,  options ).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data))
      })
    );
    
  }


  delete_insertion( params: any ): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.uhs.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };
    console.log('Deleting Insertion ' + JSON.stringify(params.id) );

    return this.http.delete( this.uhs.url + '/insertions/' + params.id, options ).pipe(
      catchError(this.handleError)
    );
  }

}
