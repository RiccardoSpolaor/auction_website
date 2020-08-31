import { Component, OnInit } from '@angular/core';
import { UserHttpService } from '../../Services/user-http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  public errmessage = undefined;
  public user = { mail: '', password: '', username: '', location: '', name: '', surname: ''};

  constructor( public uhs: UserHttpService, public router: Router ) { }

  ngOnInit() {
  }

  signup() {
    this.uhs.register( this.user ).subscribe( (d) => {
      console.log('Registration ok: ' + JSON.stringify(d) );
      this.errmessage = undefined;
      this.uhs.login(this.user.mail, this.user.password).subscribe( (d) => {
        console.log('Login granted: ' + JSON.stringify(d) );
        console.log('User service token: ' + this.uhs.get_token() );
        this.errmessage = undefined;
        this.router.navigate(['/insertions']);
      }, (err) => {
        console.log('Login error: ' + JSON.stringify(err) );
        this.errmessage = err.message;
  
      });
    }, (err) => {
      console.log('Signup error: ' + JSON.stringify(err.error.errormessage) );
      this.errmessage = err.error.errormessage || err.error.message;

    });

  }

}