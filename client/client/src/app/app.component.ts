import { Component } from '@angular/core';
import { UserHttpService } from './Services/user-http.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public title = 'Client'

  constructor( private uhs: UserHttpService){}

  ngOnInit(): void {
    this.uhs.set_token_from_storage();
  }


}


