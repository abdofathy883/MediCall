import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ComplaintsComponent } from './complaints/complaints.component';
import { ContactComponent } from './contact/contact.component';
import { LogInComponent } from './log-in/log-in.component';
import { RegisterComponent } from './register/register.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { MapPageComponent } from './map-page/map-page.component';
import { RegisterNurseComponent } from './register-nurse/register-nurse.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'map',
    component: MapPageComponent,
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
    path: 'login',
    component: LogInComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'register-nurse',
    component: RegisterNurseComponent,
  },
  {
    path: 'my-account',
    loadComponent: () => import('./my-account/my-account.component').then(m => m.MyAccountComponent),
    // component: MyAccountComponent,
    canActivate: ['authGuard']
  },
  {
    path: '**',
    component: NotfoundComponent,
  },
];
