import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router'
import { SocketioService } from '../../Services/socketio.service';
import { UserHttpService } from '../../Services/user-http.service';
import { User } from '../../Objects/User'
import { isIosUser, isIosUserDeleted } from 'src/app/Objects/IosObject';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {

  public users : User[]
  private subscriptions : Subscription = new Subscription()

  constructor( private uhs : UserHttpService, private router: Router, private sio: SocketioService) { }

  ngOnInit(): void {
    if (this.uhs.get_token() && this.uhs.is_moderator() && this.uhs.is_validated()){
      this.get_users()
      this.subscriptions.add(this.sio.connect().subscribe( (m) => {
        if(isIosUser(m) || isIosUserDeleted(m))
          this.get_users()
      }));
    }else 
      this.router.navigate(['**'])
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe()
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
