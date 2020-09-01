import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserHttpService } from '../../Services/user-http.service';
import { NotificationHttpService } from '../../Services/notification-http.service';
import { PrivateChatHttpService } from '../../Services/private-chat-http.service';
import { SocketioService } from '../../Services/socketio.service';
import { isIosNotification, isIosUserDeleted, isIosPrivateChatList } from '../../Objects/IosObject' 
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  public notificationsCount : number
  public chatsCount : number
  private subscriptions : Subscription = new Subscription()

  constructor(private router: Router, private uhs: UserHttpService, private nhs : NotificationHttpService, private sio : SocketioService, private pchs : PrivateChatHttpService) { }

  ngOnInit(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false //ricarica nuovamente la pagina
    if(this.uhs.get_token()) {
      this.getUnreadNotificationsCount()
      this.getUnreadChatsCount()
    }
    
    this.subscriptions.add(this.nhs.notificationsState.subscribe(() => this.getUnreadNotificationsCount()))
    this.subscriptions.add(this.pchs.chatsState.subscribe(() => this.getUnreadChatsCount() ))

    this.subscriptions.add(
      this.sio.connect().subscribe( (m) => {
        if (this.hasToken() && isIosNotification(m) && m.user == this.getToken().id )
          this.getUnreadNotificationsCount()

        else if (isIosPrivateChatList(m) && m.users.includes(this.uhs.get_id() ))
          this.getUnreadChatsCount();

        else if( this.hasToken() && isIosUserDeleted(m) && m.id == this.getToken().id)
          this.logout()
      })
    )
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe()
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

  public getUnreadChatsCount() {
    this.pchs.get_unread_chats_count().subscribe(
      ( chatsCount ) => {
        this.chatsCount = chatsCount;
      } , (err) => {
        console.log(err)
        this.chatsCount = 0;
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
    this.chatsCount = undefined
    this.router.navigate(['/insertions']);
  }

}
