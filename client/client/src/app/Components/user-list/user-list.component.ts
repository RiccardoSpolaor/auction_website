import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { SocketioService } from '../../Services/socketio.service';
import { UserHttpService } from '../../Services/user-http.service';
import { User } from '../../Objects/User'

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  public users : User[]

  constructor( private uhs : UserHttpService, private router: Router) { }

  ngOnInit(): void {
    if (this.uhs.get_token() && this.uhs.is_moderator() && this.uhs.is_validated())
      this.get_users()
    else 
      this.router.navigate(['**'])
  }

  public get_users() {
    this.uhs.get_users().subscribe(
      ( users ) => {
        this.users = users;
      }, (err) => {
        console.log(err)
        this.router.navigate(['**'])
      });
  }

  hasToken(): boolean {
    return this.uhs.get_token()!= undefined
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

  public delete_user(id : string) {
    if(confirm("Do you really want to delete this user?")) {
      this.uhs.delete_user(id).subscribe(
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
