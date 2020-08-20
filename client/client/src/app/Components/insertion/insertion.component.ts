import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class InsertionComponent implements OnInit, OnDestroy {

  public insertion: Insertion;
  public errmessage = undefined;
  private interval

  constructor( private sio: SocketioService , public ihs: InsertionHttpService, public us: UserService, private router: Router , private route: ActivatedRoute) {}

  ngOnInit() {
    this.get_insertion();
    this.sio.connect().subscribe( (m) => {
      //this.get_insertions();
    });
  }

  ngOnDestroy() {
    clearInterval(this.interval)
  }

  public get_insertion() {
    this.ihs.get_insertion(this.route.snapshot.params).subscribe(
      ( insertion ) => {
        if (!insertion)
          this.router.navigate(['**'])
        else {
          this.insertion = insertion;
          this.insertion.remaining_time = this.getRemainingTime()
          if (this.insertion.remaining_time) {
            this.interval = setInterval(() => {
              this.insertion.remaining_time = this.getRemainingTime()
              if (!this.insertion.remaining_time) {
                this.insertion.closed = true;
                clearInterval(this.interval)
              }
            }, 1000)
          }
          else {
            this.insertion.closed = true
          }
        }
        //this.setRemainingTime()
      } , (err) => {
        console.log(err)
        this.router.navigate(['**'])
      }
    );
  }


  private getRemainingTime() {
    const date1 = new Date()
    const date2 = new Date(this.insertion.expire_date)
    const diffTime = date2.getTime() - date1.getTime();

    if (diffTime <= 0)
      return undefined

    var seconds = Math.floor(diffTime / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);

    hours %= 24
    minutes %= 60;
    seconds %= 60;

    return days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's'
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
    if(confirm("Do you really want to delete this insertion?")) {
      this.ihs.delete_insertion (this.route.snapshot.params).subscribe(
        (data) => {
          this.router.navigate(['/insertions'])
        }
      );
    }
  }
   
}
