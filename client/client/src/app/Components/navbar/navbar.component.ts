import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserHttpService } from '../../Services/user-http.service';
import { NotificationHttpService } from '../../Services/notification-http.service';
import { SocketioService } from '../../Services/socketio.service';
import { isIosNotification } from '../../Objects/IosObject' 

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  public notificationsCount : number

  constructor(private router: Router, private uhs: UserHttpService, private nhs : NotificationHttpService, private sio : SocketioService) { }

  ngOnInit(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false //ricarica nuovamente la pagina
    
    if(this.uhs.get_token())
      this.getUnreadNotificationsCount()
      
    this.nhs.notificationsState.subscribe(() => this.getUnreadNotificationsCount() )

    this.sio.connect().subscribe( (m) => {
      if (this.hasToken() && isIosNotification(m) && m.user == this.getToken().id )
        this.getUnreadNotificationsCount()
    });
  }

  public getUnreadNotificationsCount() {
    this.nhs.get_unread_notifications_count().subscribe(
      ( notificationsCount ) => {
        this.notificationsCount = notificationsCount;
      } , (err) => {
        console.log(err)
        this.notificationsCount = 0;
      }
    );
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

  logout(){
    this.uhs.logout();
    this.notificationsCount = undefined
    this.router.navigate(['/insertions']);
  }

  search(title: string, faculty: string, university: string, location: string, user: string, price: string) {
   var params = {
     title: title.length?title:undefined,
     faculty: faculty.length?faculty:undefined,
     university: university.length?university:undefined,
     location: location.length?location:undefined,
     user: user.length?user:undefined,
     price: price.length?price:undefined
   }
   this.router.navigate(['/insertions'], { queryParams: params });

  };

}
