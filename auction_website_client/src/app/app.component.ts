import { Component, OnInit, OnDestroy} from '@angular/core';
import { UserHttpService } from './Services/user-http.service';
import { Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy{

  public title = 'Client'
  private polling

  constructor( private uhs: UserHttpService, private router: Router ){}

  ngOnInit(): void {
    this.uhs.set_token_from_storage();
    this.polling = setInterval(()=>{
      if(this.uhs.tokenExpired()){
        alert("Your token is expired, you'll be logged out and redirected to the login page")
        this.uhs.logout()
        this.router.navigate(['/login'])
      }
    },2000)
  }

  ngOnDestroy(){
    clearInterval(this.polling)
  }

}


