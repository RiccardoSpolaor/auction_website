import { Component, OnInit } from '@angular/core';
import { InsertionHttpService } from '../../Services/insertion-http.service';
import { Router, ActivatedRoute } from '@angular/router';

import {Insertion} from '../../Objects/Insertion'

@Component({
  selector: 'app-edit-insertion',
  templateUrl: './edit-insertion.component.html',
  styleUrls: ['./edit-insertion.component.css']
})
export class EditInsertionComponent implements OnInit {

  public errmessage = undefined;
  public oldInsertion = { title: '', authors: [], edition: undefined, faculty: '', university: '', reserve_price: undefined, start_price: undefined, 
    expire_date: undefined, current_price: undefined , insertion_timestamp: undefined};
  public insertion = { title: undefined, authors: undefined, edition: undefined, faculty: undefined, university: undefined, reserve_price: undefined, start_price: undefined, expire_date: undefined};
  public authorInput

  constructor(private ihs : InsertionHttpService, private router: Router, private route : ActivatedRoute) { }

  ngOnInit() {
    this.get_insertion();
  }

  public add_authors( tag: string ) {
    this.insertion.authors = this.insertion.authors.concat([ tag]);
  }

  public get_today_date() {
    return new Date()
  }

  public get_insertion() {
    this.ihs.get_insertion(this.route.snapshot.params).subscribe(
      ( insertion : Insertion ) => {
        this.oldInsertion.title = insertion.title;
        this.oldInsertion.authors = insertion.authors;
        this.oldInsertion.edition = insertion.edition;
        this.oldInsertion.faculty = insertion.faculty;
        this.oldInsertion.university = insertion.university
        this.oldInsertion.reserve_price = insertion.reserve_price;
        this.oldInsertion.start_price = insertion.start_price;
        this.oldInsertion.current_price = insertion.current_price;
        this.oldInsertion.expire_date = insertion.expire_date;
        this.oldInsertion.insertion_timestamp = insertion.insertion_timestamp

        this.insertion.authors = this.oldInsertion.authors;
      } , (err) => {
        console.log(err)
      }
    );
  }

  public edit_insertion () {
    

    this.insertion.edition = this.insertion.edition != undefined ? Number(this.insertion.edition) : undefined;
    this.insertion.start_price = this.insertion.start_price != undefined ? Number(this.insertion.start_price) : undefined;
    this.insertion.reserve_price = this.insertion.reserve_price != undefined ? Number(this.insertion.reserve_price) : undefined;

    this.insertion.expire_date = this.insertion.expire_date != undefined ? new Date(this.insertion.expire_date) : undefined
    
    if (this.insertion.expire_date) {
      this.insertion.expire_date = {
        year: this.insertion.expire_date.getFullYear(),
        month: this.insertion.expire_date.getMonth(),
        day: this.insertion.expire_date.getDate(),
        hours: this.insertion.expire_date.getHours(),
        minutes: this.insertion.expire_date.getMinutes() 
      }
    }

    this.ihs.edit_insertion(this.route.snapshot.params, this.insertion).subscribe( (d) => {
      console.log('Insertion Posted: ' + JSON.stringify(d) );
      this.errmessage = undefined;
      this.router.navigate(['/insertions/' + this.route.snapshot.params.id]);
    }, (err) => {
      console.log('Signup error: ' + JSON.stringify(err.error.errormessage) );
      this.errmessage = err.error.errormessage || err.error.message;

    });
    
  }

  public are_start_and_reserve_price_compatible (start_price : number, reserve_price : number) {
        return (reserve_price == undefined && start_price == undefined) ||
        (reserve_price != undefined && start_price == undefined && reserve_price > this.oldInsertion.start_price) ||
        (reserve_price == undefined && start_price != undefined  && this.oldInsertion.reserve_price > start_price) ||
        (reserve_price != undefined && start_price != undefined && reserve_price > start_price)
  }

}
