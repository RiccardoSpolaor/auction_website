import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { SocketioService } from '../../Services/socketio.service';
import { UserHttpService } from '../../Services/user-http.service';
import { PrivateChatHttpService } from '../../Services/private-chat-http.service';
import { PrivateChat } from '../../Objects/PrivateChat';
import { isIosInsertion, isIosMessage } from '../../Objects/IosObject' 
import { Message } from '../../Objects/Message';

@Component({
  selector: 'app-private-chat',
  templateUrl: './private-chat.component.html',
  styleUrls: ['./private-chat.component.css']
})
export class PrivateChatComponent implements OnInit {

  public chat: PrivateChat;

  constructor( private sio: SocketioService , public pchs: PrivateChatHttpService, public uhs: UserHttpService, private router: Router , private route: ActivatedRoute) {}


  ngOnInit(): void {
    this.get_chat();
  }

  public get_chat(){
    this.pchs.get_chat(this.route.snapshot.params).subscribe(
      ( chat ) => {
        if (!chat)
          this.router.navigate(['**'])
        else 
          this.chat = chat;
      } , (err) => {
        console.log(err)
        this.router.navigate(['**'])
      }
    );
  }

  public isCurrentUser(message: Message){
    var token_info = this.uhs.get_id()
    if(message.author && message.author._id==token_info)
      return true;
  
    return false
  }

  public get_other_user(){
    var token_info = this.uhs.get_id()
    if(this.chat.sender && this.chat.sender._id!=token_info)
      return this.chat.sender.username;
    
    if(this.chat.insertionist && this.chat.insertionist._id!=token_info)
      return this.chat.insertionist.username

    return 'User deleted'
  }

}

