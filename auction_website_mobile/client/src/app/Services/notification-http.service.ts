import { Injectable } from '@angular/core';
import { Notification } from '../Objects/Notification';
import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { Subject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { UserHttpService } from './user-http.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationHttpService {

  private notificationsStateSource = new Subject<any>();
  public notificationsState = this.notificationsStateSource.asObservable();

  constructor(private http: HttpClient, private uhs: UserHttpService ) {
    console.log('Notification service instantiated');
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

  get_notifications(): Observable<Notification[]> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.uhs.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };
    return this.http.get<Notification[]>( this.uhs.url + '/notifications', options).pipe(
        tap( (data) => console.log(JSON.stringify(data))) ,
        catchError( this.handleError )
      );
  }

  put_notification_read(id: string) : Observable <any> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.uhs.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };
    return this.http.put( this.uhs.url + '/notifications/' + id, {}, options ).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data) );
      })
    );
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
}
