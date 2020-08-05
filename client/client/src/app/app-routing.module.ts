import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InsertionListComponent } from './Components/insertion-list/insertion-list.component';
import { LoginComponent } from './Components/login/login.component';
import { SignupComponent } from './Components/signup/signup.component';
import { SignupmodComponent } from './Components/signupmod/signupmod.component';
import { EditProfileComponent } from './Components/edit-profile/edit-profile.component';
import { InsertionComponent } from './Components/insertion/insertion.component';

const routes: Routes = [
  { path: '', redirectTo: '/insertions', pathMatch: 'full' },
  { path: 'insertions', component: InsertionListComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'signupmod', component: SignupmodComponent },
  { path: 'editprofile', component: EditProfileComponent },
  { path: 'insertion/:id', component: InsertionComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
