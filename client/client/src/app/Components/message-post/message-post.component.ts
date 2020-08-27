import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { Message } from '../../Objects/Message';
import { InsertionHttpService } from '../../Services/insertion-http.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-message-post',
  templateUrl: './message-post.component.html',
  styleUrls: ['./message-post.component.css']
})

export class MessagePostComponent implements OnInit {


  constructor( private ihs: InsertionHttpService, private route : ActivatedRoute ) { }

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

  /*checkAnswer(){
    alert(this.isAnswer)
    return true;
  }*/

  post_message(check?:boolean) {
    if(check)
      alert("chat privata")
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

