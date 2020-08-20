import { Component, OnInit } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { NotificationHttpService } from '../../Services/notification-http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public errmessage = undefined;
  constructor( private us: UserService, private router: Router, private nhs : NotificationHttpService  ) { }

  ngOnInit(): void { }

  login( mail: string, password: string) {
    this.us.login( mail, password).subscribe( (d) => {
      console.log('Login granted: ' + JSON.stringify(d) );
      console.log('User service token: ' + this.us.get_token() );
      this.errmessage = undefined;
      this.nhs.set_notifications_state_after_login()
      if(this.us.is_moderator() && !this.us.is_validated())
        this.router.navigate(['/editprofile'])
      else 
        this.router.navigate(['/insertions'])
    }, (err) => {
      console.log('Login error: ' + JSON.stringify(err) );
      this.errmessage = err.message;

    });

  }

}
