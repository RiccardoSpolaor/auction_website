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
      //this.get_insertions();
    });
  }

  public get_insertions() {
    console.log('err')
    this.ihs.get_insertions().subscribe(
      ( insertions ) => {
        this.insertions = insertions;
        this.setRemainingTime()
      } , (err) => {
        // We need to login again
        //this.logout();
        console.log(err)
      }
    );
  }


  public setRemainingTime() {
    setInterval ( () => {
      this.insertions.forEach(elem => {
        const date1 = new Date()
        const date2 = new Date(elem.expire_date)
        const diffTime = date2.getTime() - date1.getTime();
        var seconds = Math.floor(diffTime / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        var days = Math.floor(hours / 24);

        hours %= 24
        minutes %= 60;
        seconds %= 60;

        elem.remaining_time = 'Days: ' + days + ' Hours: ' + hours + ' Minutes: ' + minutes + ' Seconds: ' + seconds
    })
  }, 1000 )
}

/*
  logout() {
    this.us.logout();
    this.router.navigate(['/']);
  }*/
}
