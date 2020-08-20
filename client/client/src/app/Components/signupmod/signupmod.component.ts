import { Component, OnInit } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signupmod',
  templateUrl: './signupmod.component.html',
  styleUrls: ['./signupmod.component.css']
})
export class SignupmodComponent implements OnInit {
  public errmessage = undefined;
  public user = { password: '', username: ''};

  constructor( public us: UserService, public router: Router ) { }

  ngOnInit() {
    if (!this.us.get_token() || !this.us.is_moderator() || !this.us.is_validated())
      this.router.navigate(['**'])
  }

  signup() {
    this.us.registerMod( this.user ).subscribe( (d) => {
      console.log('Registration ok: ' + JSON.stringify(d) );
      this.errmessage = undefined;
      this.router.navigate(["/insertions"]);
    }, (err) => {
      console.log('Signup error: ' + JSON.stringify(err.error.errormessage) );
      this.errmessage = err.error.errormessage || err.error.message;

    });

  }

}
