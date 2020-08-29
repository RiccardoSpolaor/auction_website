import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { SocketioService } from '../../Services/socketio.service';
import { UserHttpService } from '../../Services/user-http.service';
import { PrivateChatHttpService } from '../../Services/private-chat-http.service';
import { PrivateChat } from '../../Objects/PrivateChat';

import { isIosPrivateChatList } from '../../Objects/IosObject' 

@Component({
  selector: 'app-private-chat-list',
  templateUrl: './private-chat-list.component.html',
  styleUrls: ['./private-chat-list.component.css']
})
export class PrivateChatListComponent implements OnInit {


  public chats: PrivateChat[]

  constructor( private sio: SocketioService , public pchs: PrivateChatHttpService, public uhs: UserHttpService, private router: Router , private route: ActivatedRoute) { }

  ngOnInit() {
    this.get_chats();
    this.sio.connect().subscribe( (m) => {
      if ((isIosPrivateChatList(m) && this.uhs.get_token() && m.users.includes(this.uhs.get_id() ))){
        this.get_chats();
      }
    });
  }

  public get_chats() {
    this.pchs.get_chats().subscribe(
      ( chats ) => {
        this.chats = chats;
      } , (err) => {
        console.log(err)
      }
    );
  }

  public get_other_user(chat:PrivateChat){
    var token_info = this.uhs.get_id()
    if(chat.sender && chat.sender._id!=token_info)
      return chat.sender.username;
    
    if(chat.insertionist && chat.insertionist._id!=token_info)
      return chat.insertionist.username

    return 'User deleted'
  }

  public get_insertion(chat:PrivateChat) {
    return chat.insertion_id?chat.insertion_id.title:'Insertion deleted'
  }

  public get_last_message(chat:PrivateChat){
    if(!chat.messages.length)
      return ''
    
    var last_message = chat.messages[chat.messages.length-1];
    
    return last_message.content.length>60?last_message.content.slice(0,59) + "...":last_message.content;
    
  }

  public isRead(chat:PrivateChat){
    var token_info = this.uhs.get_id()
    if(chat.sender && chat.sender._id==token_info)
      return chat.senderRead;
    
    if(chat.insertionist && chat.insertionist._id==token_info)
      return chat.insertionistRead;

    return false;
  }

  public goToChat(chat:PrivateChat){
    this.router.navigate(['/private_chats/' + chat._id])/*.then(()=>{
      this.pchs.put_chat_read(chat._id).subscribe(
        (err) => {
          console.log(err)
        }
      );
    });*/
  }
}
