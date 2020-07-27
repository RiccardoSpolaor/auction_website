import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InsertionListComponent } from './Components/insertion-list/insertion-list.component';

const routes: Routes = [
  { path: '', redirectTo: '/insertions', pathMatch: 'full' },
  { path: 'insertions', component: InsertionListComponent },
  //{ path: 'signup', component: UserSignupComponent },
  //{ path: 'messages', component: MessageListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
