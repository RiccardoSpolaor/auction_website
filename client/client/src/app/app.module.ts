import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { MDBBootstrapModule } from 'angular-bootstrap-md';

import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Services
//import { MessageService } from './message.service';
//import { MessageHttpService } from './message-http.service';
import { UserService } from './Services/user.service';
import { UserHttpService } from './Services/user-http.service';
//import { UserLoginComponent } from './Services/user-login/user-login.component';
//import { UserSignupComponent } from './Services/user-signup/user-signup.component';
import { SocketioService } from './Services/socketio.service';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InsertionListComponent } from './Components/insertion-list/insertion-list.component';
import { InsertionHttpService } from './Services/insertion-http.service';
import { NavbarComponent } from './Components/navbar/navbar.component';
import { LoginComponent } from './Components/login/login.component';
import { SignupComponent } from './Components/signup/signup.component';
import { SignupmodComponent } from './Components/signupmod/signupmod.component';
import { EditProfileComponent } from './Components/edit-profile/edit-profile.component';
import { InsertionComponent } from './Components/insertion/insertion.component';
import { MessagePostComponent } from './Components/message-post/message-post.component';

@NgModule({
  declarations: [
    AppComponent,
    InsertionListComponent,
    NavbarComponent,
    LoginComponent,
    SignupComponent,
    SignupmodComponent,
    EditProfileComponent,
    InsertionComponent,
    MessagePostComponent
  ],
  imports: [
    MDBBootstrapModule.forRoot(),
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    {provide: UserService, useClass: UserHttpService },
    {provide: SocketioService, useClass: SocketioService },
    {provide: InsertionHttpService, useClass: InsertionHttpService} /* Here we can select the specifc service instance */
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
 