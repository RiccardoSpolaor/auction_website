import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InsertionListComponent } from './Components/insertion-list/insertion-list.component';
import { LoginComponent } from './Components/login/login.component';
import { SignupComponent } from './Components/signup/signup.component';
import { SignupmodComponent } from './Components/signupmod/signupmod.component';
import { EditProfileComponent } from './Components/edit-profile/edit-profile.component';
import { InsertionComponent } from './Components/insertion/insertion.component';
import { MessageReplyComponent } from './Components/message-reply/message-reply.component';
import { PrivateChatListComponent } from './Components/private-chat-list/private-chat-list.component';

const routes: Routes = [
  { path: '', redirectTo: '/insertions', pathMatch: 'full' },
  { path: 'insertions', component: InsertionListComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'signupmod', component: SignupmodComponent },
  { path: 'editprofile', component: EditProfileComponent },
  { path: 'insertions/:id', component: InsertionComponent },
  { path: 'insertions/:id/public_message/:m_id', component: MessageReplyComponent},
  { path: 'private_chats', component: PrivateChatListComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
