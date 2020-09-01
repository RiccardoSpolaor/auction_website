import { Component, OnInit } from '@angular/core';
import { UserHttpService } from '../../Services/user-http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-stats',
  templateUrl: './user-stats.component.html',
  styleUrls: ['./user-stats.component.css']
})
export class UserStatsComponent implements OnInit {

  public mod_stats;
  public student_stats;


  constructor( public uhs: UserHttpService, public router: Router ) { }
  
  ngOnInit(): void {
    this.get_stats();
  }

  public get_stats(){
    if(this.uhs.is_moderator()){
      this.uhs.get_mod_stats().subscribe((stats) => {
          this.mod_stats=stats 
      });
    }else{
      this.uhs.get_student_stats().subscribe((stats) => {
        this.student_stats=stats 
    });
    }
  }

}
