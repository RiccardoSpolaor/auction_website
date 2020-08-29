import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { SocketioService } from '../../Services/socketio.service';
import { UserHttpService } from '../../Services/user-http.service';
import { InsertionHttpService } from '../../Services/insertion-http.service';
import { Insertion } from '../../Objects/Insertion';
import { isIosInsertion } from '../../Objects/IosObject' 



@Component({
  selector: 'app-insertion-list',
  templateUrl: './insertion-list.component.html',
  styleUrls: ['./insertion-list.component.css']
})
export class InsertionListComponent implements OnInit, OnDestroy {


  public insertions: Insertion[]
  private interval

  constructor( private sio: SocketioService , public ihs: InsertionHttpService, private router: Router , private route: ActivatedRoute) { }

  ngOnInit() {
    this.get_insertions(this.route.snapshot.queryParams);
    this.sio.connect().subscribe( (m) => {
      this.get_insertions(this.route.snapshot.queryParams)
    });
  }

  ngOnDestroy() {
    clearInterval(this.interval)
  }

  public get_insertions(params? : any) {
    this.ihs.get_insertions(params).subscribe(
      ( insertions ) => {
        clearInterval(this.interval)
        this.insertions = insertions;


        this.insertions.forEach(elem => {
          elem.remaining_time = this.getRemainingTime(elem)
        })

        this.interval = setInterval( () => {
          var available = 0
          this.insertions.forEach(elem => {
            elem.remaining_time = this.getRemainingTime(elem)
            if (!elem.remaining_time) {
              elem.closed = true;
            }
            else
              available++;
          })
          if (!available) {
            clearInterval(this.interval)
          }
        }, 1000)
      } , (err) => {
        console.log(err)
      }
    );
  }

  private getRemainingTime(insertion : Insertion) {
    const date1 = new Date()
    const date2 = new Date(insertion.expire_date)
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

  private setRemainingTime() {
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

        elem.remaining_time = days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's'
      })
    }, 1000 )
  }
}
