import { Component, OnInit } from '@angular/core';
import { InsertionHttpService } from '../../Services/insertion-http.service';
import { UserHttpService } from '../../Services/user-http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-insertion',
  templateUrl: './post-insertion.component.html',
  styleUrls: ['./post-insertion.component.css']
})
export class PostInsertionComponent implements OnInit {

  public errmessage = undefined;
  public insertion = { title: '', authors: [], edition: undefined, faculty: '', university: '', reserve_price: undefined, start_price: undefined, expire_date: undefined};
  public authorInput

  constructor(private ihs : InsertionHttpService, private router: Router, private uhs : UserHttpService) { }

  ngOnInit(): void {
    if (!this.uhs.get_token() || this.uhs.is_moderator() )
      this.router.navigate(['**'])
  }

  public add_authors( tag: string ) {
    this.insertion.authors = this.insertion.authors.concat([ tag]);
  }

  public get_today_date() {
    return new Date()
  }

  post_insertion() {
    this.insertion.edition = Number(this.insertion.edition);
    this.insertion.start_price = Number(this.insertion.start_price);
    this.insertion.reserve_price = Number(this.insertion.reserve_price);

    this.insertion.expire_date = new Date(this.insertion.expire_date)
    this.insertion.expire_date = {
      year: this.insertion.expire_date.getFullYear(),
      month: this.insertion.expire_date.getMonth(),
      day: this.insertion.expire_date.getDate(),
      hours: this.insertion.expire_date.getHours(),
      minutes: this.insertion.expire_date.getMinutes() 

    }


    this.ihs.post_insertion(this.insertion).subscribe( (d) => {
      console.log('Insertion Posted: ' + JSON.stringify(d) );
      this.errmessage = undefined;
      this.router.navigate(['/insertions/' + d.id]);
    }, (err) => {
      console.log('Signup error: ' + JSON.stringify(err.error.errormessage) );
      this.errmessage = err.error.errormessage || err.error.message;

    });
  }

}
