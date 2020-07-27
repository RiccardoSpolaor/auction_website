import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SocketioService } from '../../Services/socketio.service';
import { UserService } from '../../Services/user.service';
import { InsertionHttpService } from '../../Services/insertion-http.service';

import { Insertion } from '../../Objects/Insertion';



@Component({
  selector: 'app-insertion-list',
  templateUrl: './insertion-list.component.html',
  styleUrls: ['./insertion-list.component.css']
})
export class InsertionListComponent implements OnInit {


  public insertions: Insertion[]

  constructor( private sio: SocketioService , public ihs: InsertionHttpService, public us: UserService, private router: Router ) { }

  ngOnInit() {
    console.log('err')
    this.get_insertions();
    this.sio.connect().subscribe( (m) => {
      this.get_insertions();
    });
  }

  public get_insertions() {
    console.log('err')
    this.ihs.get_insertions().subscribe(
      ( insertions ) => {
        this.insertions = insertions;

      } , (err) => {
        // We need to login again
        //this.logout();
        console.log(err)
      }
    );
  }
/*
  logout() {
    this.us.logout();
    this.router.navigate(['/']);
  }*/
}
