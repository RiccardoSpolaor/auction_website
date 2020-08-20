import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../Services/user.service';
import { NotificationHttpService } from '../../Services/notification-http.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  public notificationsCount : number

  constructor(private router: Router, private us: UserService, private nhs : NotificationHttpService) { }

  ngOnInit(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false //ricarica nuovamente la pagina
    
    if(this.us.get_token())
      this.getUnreadNotificationsCount()
      
    this.nhs.notificationsState.subscribe(() => this.getUnreadNotificationsCount() )
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

  logout(){
    this.us.logout();
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
