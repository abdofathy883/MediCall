import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutUsComponent } from './shared/components/about-us/about-us.component';
import { ComplaintsComponent } from './shared/components/complaints/complaints.component';
import { ContactComponent } from './shared/components/contact/contact.component';
import { LogInComponent } from './log-in/log-in.component';
import { RegisterComponent } from './register/register.component';
import { NotfoundComponent } from './shared/components/notfound/notfound.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'about-us',
    component: AboutUsComponent,
  },
  {
    path: 'complaints',
    component: ComplaintsComponent,
  },
  {
    path: 'contact',
    component: ContactComponent,
  },
  {
    path: 'account/login',
    component: LogInComponent,
  },
  {
    path: 'account/register',
    component: RegisterComponent,
  },
  {
    path: 'my-account',
    component: MyAccountComponent,
    canActivate: [authGuard]
  },
  {
    path: 'patient',
    canActivate: [authGuard],
    data: { role: 'Patient' },
    children: [
    
    ]
  },
  {
    path: 'nurse',
    canActivate: [authGuard],
    data: { role: 'Nurse' },
    children: [
    ]
  },
  {
    path: 'unauthorized',
    component: NotfoundComponent, 
  },
  {
    path: '**',
    component: NotfoundComponent,
  },
];
