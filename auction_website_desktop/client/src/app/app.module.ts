import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UserHttpService } from './Services/user-http.service';
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
import { MessageReplyComponent } from './Components/message-reply/message-reply.component';
import { PrivateChatListComponent } from './Components/private-chat-list/private-chat-list.component';
import { PrivateChatHttpService } from './Services/private-chat-http.service';
import { PostInsertionComponent } from './Components/post-insertion/post-insertion.component';
import { EditInsertionComponent } from './Components/edit-insertion/edit-insertion.component';
import { PageNotFoundComponent } from './Components/page-not-found/page-not-found.component';
import { UserListComponent } from './Components/user-list/user-list.component';
import { PrivateChatComponent } from './Components/private-chat/private-chat.component';
import { NotificationsComponent } from './Components/notifications/notifications.component';
import { UserStatsComponent } from './Components/user-stats/user-stats.component';

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
    MessagePostComponent,
    MessageReplyComponent,
    PrivateChatListComponent,
    PostInsertionComponent,
    EditInsertionComponent,
    PageNotFoundComponent,
    UserListComponent,
    PrivateChatComponent,
    NotificationsComponent,
    UserStatsComponent
  ],
  imports: [
    MDBBootstrapModule.forRoot(),
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    {provide: UserHttpService, useClass: UserHttpService },
    {provide: SocketioService, useClass: SocketioService },
    {provide: InsertionHttpService, useClass: InsertionHttpService},
    {provide: PrivateChatHttpService, useClass: PrivateChatHttpService}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
 