import { Component, inject, Input, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserManagementService } from '../Services/user-management.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  private userService = inject(UserManagementService);
  private router = inject(Router);
  isLoggedIn: boolean = false; 

  ngOnInit(){
    this.userService.isLoggedIn.subscribe(status => {
      this.isLoggedIn = status;
    });

    const token = localStorage.getItem('token');

    if (token) {
      this.userService.SetLoginStatus(true);
    }
  }
}
