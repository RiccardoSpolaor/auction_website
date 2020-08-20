import { Injectable } from '@angular/core';
import { Insertion } from '../Objects/Insertion';

import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { Subject } from 'rxjs';

import { tap, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationHttpService {

  // Subject object and its observable that lets the login-component communicate with the navbar and reload the notifications count when a user logs in.
  private notificationsStateSource = new Subject<any>();
  public notificationsState = this.notificationsStateSource.asObservable();

  constructor(private http: HttpClient, private us: UserService ) {
    console.log('Notification service instantiated');
    console.log('User service token: ' + us.get_token() );
  }

  set_notifications_state_after_login() {
    this.notificationsStateSource.next()
  }

  get_unread_notifications_count(): Observable<number> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.us.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };
    
    return this.http.get<number>( this.us.url + '/notifications/unreadcount', options ).pipe(
      tap( (data) => {
        console.log(data);
      })
    );
  }
}
