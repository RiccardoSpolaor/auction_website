import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { SocketioService } from '../../Services/socketio.service';
import { UserHttpService } from '../../Services/user-http.service';
import { PrivateChatHttpService } from '../../Services/private-chat-http.service';
import { PrivateChat } from '../../Objects/PrivateChat';

@Component({
  selector: 'app-private-chat-list',
  templateUrl: './private-chat-list.component.html',
  styleUrls: ['./private-chat-list.component.css']
})
export class PrivateChatListComponent implements OnInit {


  public chats: PrivateChat[]
  public active_chat: PrivateChat

  constructor( private sio: SocketioService , public pchs: PrivateChatHttpService, public uhs: UserHttpService, private router: Router , private route: ActivatedRoute) { }

  async ngOnInit() {
    await this.get_chats();
    this.active_chat = this.chats[0];
    alert(JSON.stringify(this.active_chat))
    this.sio.connect().subscribe( (m) => {
      //this.get_insertions();
    });
  }

  public async get_chats() {
    this.pchs.get_chats().subscribe(
      ( chats ) => {
        this.chats = chats;
      } , (err) => {
        console.log(err)
      }
    );
  }

  public get_other_user(chat:PrivateChat){
    var token_info = this.uhs.get_token()._id;
    if(chat.sender && chat.sender._id!=token_info)
      return chat.sender.username;
    
    if(chat.insertionist && chat.insertionist._id!=token_info)
      return chat.insertionist.username

    return 'User deleted'
  }

  public get_insertion(chat:PrivateChat) {
    return chat.insertion_id?chat.insertion_id.title:'Insertion deleted'
  }
}
