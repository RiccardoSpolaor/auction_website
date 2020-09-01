import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserHttpService } from './user-http.service';
import * as io from 'socket.io-client';

@Injectable()
export class SocketioService {

  private socket;
  constructor( private uhs: UserHttpService ) { }

  connect(): Observable< any > {

    this.socket = io(this.uhs.url);

    return new Observable( (observer) => {

      this.socket.on('broadcast', (m) => {
        console.log('Socket.io message received: ' + JSON.stringify(m) );
        observer.next( m );

      });

      this.socket.on('error', (err) => {
        console.log('Socket.io error: ' + err );
        observer.error( err );
      });

    });
  }

}
