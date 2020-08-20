import { Component, OnInit } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {

  public errmessage = undefined;
  public user = { mail: undefined, password: undefined, username: undefined, location: undefined, name: undefined, surname: undefined};

  constructor( public us: UserService, public router: Router ) { }

  ngOnInit() {
    if (!this.us.get_token())
      this.router.navigate(['**'])
  }

  getToken(){
    return {
      username: this.us.get_username(),
      mail: this.us.get_mail(),
      id: this.us.get_id(),
      mod: this.us.is_moderator(),
      validated: this.us.is_validated()
    }
  }

  edit(){
    this.us.edit( this.user ).subscribe( (d) => {
      console.log('Registration ok: ' + JSON.stringify(d) );
      this.errmessage = undefined;
      this.router.navigate(['/insertions']);
    }, (err) => {
      console.log('Signup error: ' + JSON.stringify(err.error.errormessage) );
      this.errmessage = err.error.errormessage || err.error.message;

    });

  }


}
