import { Component, OnInit } from '@angular/core';
import { UserHttpService } from '../../Services/user-http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signupmod',
  templateUrl: './signupmod.component.html',
  styleUrls: ['./signupmod.component.css']
})

export class SignupmodComponent implements OnInit {
  public errmessage = undefined;
  public user = { password: '', username: ''};

  constructor( public uhs: UserHttpService, public router: Router ) { }

  ngOnInit() {
    if (!this.uhs.get_token() || !this.uhs.is_moderator() || !this.uhs.is_validated())
      this.router.navigate(['**'])
  }

  signup() {
    this.uhs.registerMod( this.user ).subscribe( (d) => {
      console.log('Registration ok: ' + JSON.stringify(d) );
      this.errmessage = undefined;
      this.router.navigate(["/insertions"]);
    }, (err) => {
      console.log('Signup error: ' + JSON.stringify(err.error.errormessage) );
      this.errmessage = err.error.errormessage || err.error.message;

    });

  }

}
