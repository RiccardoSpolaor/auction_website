import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserHttpService } from '../../Services/user-http.service';
import { InsertionHttpService } from '../../Services/insertion-http.service';
import { Insertion } from '../../Objects/Insertion';
import { Message } from '../../Objects/Message';

@Component({
  selector: 'app-message-reply',
  templateUrl: './message-reply.component.html',
  styleUrls: ['./message-reply.component.css']
})
export class MessageReplyComponent implements OnInit {

  public insertion : Insertion
  public message : Message
  constructor( public ihs: InsertionHttpService, public uhs: UserHttpService, private router: Router , private route: ActivatedRoute) {}

  ngOnInit(): void {
    if (this.uhs.get_token())
      this.get_insertion()
    else
      this.router.navigate(['**'])
  }

  public get_insertion() {
    this.ihs.get_insertion(this.route.snapshot.params).subscribe(
      ( insertion ) => {
        if (!insertion)
          this.router.navigate(['**'])
        else {
          this.insertion = insertion;
          this.get_message();
        }
      } , (err) => {
        console.log(err)
        this.router.navigate(['**'])
      }
    );
  }

  public get_message() {
    this.message = this.insertion.messages.find((element)=>{return element._id==this.route.snapshot.params.m_id})
    if(!this.message) {
      console.log("Not Found")
      this.router.navigate(['**'])
    }

  }

  public returnToInsertion(){
    this.router.navigate(['/insertions/'+this.route.snapshot.params.id])
  }

}
