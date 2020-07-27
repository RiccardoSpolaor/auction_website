import { Component, OnInit } from '@angular/core';
import { MessageService } from '../message.service';
import { Message } from '../Message';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { SocketioService } from '../socketio.service';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.css']
})
export class MessageListComponent implements OnInit {

  public messages: Message[] = [];

  constructor( private sio: SocketioService , public ms: MessageService, public us: UserService, private router: Router ) { }

  ngOnInit() {
    this.get_messages();
    this.sio.connect().subscribe( (m) => {
      this.get_messages();
    });
  }

  public get_messages() {
    this.ms.get_messages().subscribe(
      ( messages ) => {
        this.messages = messages;

      } , (err) => {
        // We need to login again
        this.logout();
      }
    );
  }

  logout() {
    this.us.logout();
    this.router.navigate(['/']);
  }

}
