import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { SocketioService } from '../../Services/socketio.service';
import { UserService } from '../../Services/user.service';
import { User } from '../../Objects/User'

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  public users : User[]

  constructor( private us : UserService, private router: Router) { }

  ngOnInit(): void {
    if (this.us.get_token() && this.us.is_moderator() && this.us.is_validated())
      this.get_users()
    else 
      this.router.navigate(['**'])
  }

  public get_users() {
    this.us.get_users().subscribe(
      ( users ) => {
        this.users = users;
      }, (err) => {
        console.log(err)
        this.router.navigate(['**'])
      });
  }

  hasToken(): boolean {
    return this.us.get_token()!= undefined
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

  public delete_user(id : string) {
    if(confirm("Do you really want to delete this user?")) {
      this.us.delete_user(id).subscribe(
        () => {
          this.get_users()
        }, (err) => {
          console.log(err)
          this.router.navigate(['**'])
        }
      );
    }
  }

}
