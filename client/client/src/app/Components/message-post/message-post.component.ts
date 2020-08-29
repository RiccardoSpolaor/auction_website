import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { Message } from '../../Objects/Message';
import { InsertionHttpService } from '../../Services/insertion-http.service';
import { PrivateChatHttpService } from '../../Services/private-chat-http.service';
import { Router, ActivatedRoute } from '@angular/router';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-message-post',
  templateUrl: './message-post.component.html',
  styleUrls: ['./message-post.component.css']
})

export class MessagePostComponent implements OnInit {


  constructor( private ihs: InsertionHttpService, private route : ActivatedRoute, private pchs: PrivateChatHttpService, private router : Router) { }

  public message : string;
  public error = undefined;
  @Input() public isAnswer : boolean;
  @Input() public isInsertionist : boolean;

  @Output() posted = new EventEmitter<Message>();

  ngOnInit() {
    this.set_empty();
  }

  set_empty() {
    this.message = '';
  }

  post_message(check?:boolean) {
    if(check)
      this.pchs.post_chat(this.message,this.route.snapshot.params.id).subscribe( (m) => {
        console.log('Message posted');
        this.error = undefined
        this.set_empty();
        this.router.navigate(['/private_chats'])
      }, (error) => {
        console.log('Error occurred while posting: ' + error);
        this.error = 'Error occurred while posting: ' + error
      });
    else{
      this.ihs.put_message( this.route.snapshot.params, this.message ).subscribe( (m) => {
        console.log('Message posted');
        this.error = undefined
        this.set_empty();
        this.posted.emit( m );
      }, (error) => {
        console.log('Error occurred while posting: ' + error);
        this.error = 'Error occurred while posting: ' + error
      });
    }
  }

  

}

