import { Component, OnInit } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  public errmessage = undefined;
  public user = { mail: '', password: '', username: '', location: '', name: '', surname: ''};

  constructor( public us: UserService, public router: Router ) { }

  ngOnInit() {
  }

  signup() {
    this.us.register( this.user ).subscribe( (d) => {
      console.log('Registration ok: ' + JSON.stringify(d) );
      this.errmessage = undefined;
      this.us.login(this.user.mail, this.user.password).subscribe( (d) => {
        console.log('Login granted: ' + JSON.stringify(d) );
        console.log('User service token: ' + this.us.get_token() );
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