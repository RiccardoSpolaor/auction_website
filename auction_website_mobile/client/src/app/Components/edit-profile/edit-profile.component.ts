import { Component, OnInit } from '@angular/core';
import { UserHttpService } from '../../Services/user-http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {

  public errmessage = undefined;
  public user = { mail: undefined, password: undefined, username: undefined, location: undefined, name: undefined, surname: undefined};

  constructor( public uhs: UserHttpService, public router: Router ) { }

  ngOnInit() {
    if (!this.uhs.get_token())
      this.router.navigate(['**'])
  }

  getToken(){
    return {
      username: this.uhs.get_username(),
      mail: this.uhs.get_mail(),
      id: this.uhs.get_id(),
      mod: this.uhs.is_moderator(),
      validated: this.uhs.is_validated()
    }
  }

  edit(){
    this.uhs.edit( this.user ).subscribe( (d) => {
      console.log('Registration ok: ' + JSON.stringify(d) );
      this.errmessage = undefined;
      this.router.navigate(['/insertions']);
    }, (err) => {
      console.log('Signup error: ' + JSON.stringify(err.error.errormessage) );
      this.errmessage = err.error.errormessage || err.error.message;

    });

  }


}
