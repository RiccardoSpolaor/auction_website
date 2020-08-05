import { Component } from '@angular/core';
import { UserService } from './Services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public title = 'Client'

  constructor( private us: UserService){}

  ngOnInit(): void {
    this.us.set_token_from_storage();
  }


}


