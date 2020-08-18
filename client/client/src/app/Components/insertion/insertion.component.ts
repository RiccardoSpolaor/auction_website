import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { SocketioService } from '../../Services/socketio.service';
import { UserService } from '../../Services/user.service';
import { InsertionHttpService } from '../../Services/insertion-http.service';
import { Insertion } from '../../Objects/Insertion';

@Component({
  selector: 'app-insertion',
  templateUrl: './insertion.component.html',
  styleUrls: ['./insertion.component.css']
})
export class InsertionComponent implements OnInit {

  public insertion: Insertion;
  public errmessage = undefined;

  constructor( private sio: SocketioService , public ihs: InsertionHttpService, public us: UserService, private router: Router , private route: ActivatedRoute) {}

  ngOnInit() {
    this.get_insertion();
    this.sio.connect().subscribe( (m) => {
      //this.get_insertions();
    });
  }

  public get_insertion() {
    this.ihs.get_insertion(this.route.snapshot.params).subscribe(
      ( insertion ) => {
        this.insertion = insertion;
        this.setRemainingTime()
      } , (err) => {
        console.log(err)
      }
    );
  }

  private setRemainingTime() {
    setInterval ( () => {
        const date1 = new Date()
        const date2 = new Date(this.insertion.expire_date)
        const diffTime = date2.getTime() - date1.getTime();
        var seconds = Math.floor(diffTime / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        var days = Math.floor(hours / 24);

        hours %= 24
        minutes %= 60;
        seconds %= 60;

        this.insertion.remaining_time = days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's'
      }, 1000 )
  }

  public get_current_winner(): string{
    return this.insertion.current_winner ? this.insertion.current_winner.username : 'None';;
  }

  public get_current_price(): number{
    return this.insertion.current_price != null ? this.insertion.current_price : 0;
  }

  public put_price(price: number){
    this.ihs.put_price(this.route.snapshot.params,Number(price)).subscribe(
      ( data ) => {
        this.errmessage = undefined;
        this.get_insertion();
      } , (err) => {
        this.errmessage = err.error.errormessage || err.error.message;
      }
    );
  }

  hasToken(): boolean {
    return this.us.get_token()!= undefined
  }

  getToken(){
    return {
      username: this.us.get_username(),
      mail: this.us.get_mail(),
      id: this.us.get_id(),
      mod: this.us.is_moderator(),
      validated: this.us.is_validated()
    }
  }

  public delete_insertion() {
    if(confirm("Do you wanna?")) {
      this.ihs.delete_insertion (this.route.snapshot.params).subscribe(
        (data) => {
          this.router.navigate(['/insertions'])
        }
      );
    }
  }
   
}
