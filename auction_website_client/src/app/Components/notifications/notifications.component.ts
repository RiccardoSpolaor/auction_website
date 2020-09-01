import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router} from '@angular/router';
import { SocketioService } from '../../Services/socketio.service';
import { UserHttpService } from '../../Services/user-http.service';
import { NotificationHttpService } from '../../Services/notification-http.service';
import { Notification } from '../../Objects/Notification';
import { isIosNotification } from '../../Objects/IosObject' 
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {

  public notifications : Notification[]
  private subscriptions : Subscription = new Subscription()

  constructor( private sio: SocketioService, public nhs: NotificationHttpService, public uhs: UserHttpService, private router: Router) { }


  ngOnInit(): void {
    if (!this.uhs.get_token())
      this.router.navigate(['**'])
    else {
      this.get_notifications();
      this.subscriptions.add(this.sio.connect().subscribe( (m) => {
        if ((isIosNotification(m) && this.uhs.get_token() && m.user == this.uhs.get_id())){
          this.get_notifications();
        }
      }));
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe()
  }

  public get_notifications() {
    this.nhs.get_notifications().subscribe(
      ( notifications ) => {
        this.notifications = notifications;
      } , (err) => {
        console.log(err)
      }
    );
  }

  public goToInsertion(notif : Notification){
    var link = notif.insertion ? '/insertions/' + notif.insertion._id : '**'
    this.router.navigate([link]).then(()=>{
      this.nhs.put_notification_read(notif._id).subscribe(
        (err) => {
          console.log(err)
        }
      );
    });
  }

  public isRead(notif:Notification){
    return notif.read;
  }

  public get_insertion(notif:Notification) {
    return notif.insertion
  }
}
