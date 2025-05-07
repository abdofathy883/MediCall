import { CoockiesService } from './../Services/Cookies/coockies.service';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserManagementService } from '../Services/user-management.service';

@Component({
  selector: 'app-my-account',
  imports: [],
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.css'
})
export class MyAccountComponent implements OnInit {
  private router = inject(Router);
  private userService = inject(UserManagementService);
  private cookiesService = inject(CoockiesService);
  userData: User | null = null;
  visits: any[] = [];
  patientId?: string = '';

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userStr || !token) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const user = JSON.parse(userStr);

      if (user && user.email) {
        this.userService.getUserByEmail(user.email).subscribe({
          next: (data) => {
            this.userData = data;

          },
          error: (err) => console.error(`Error fetching user`, err)
         
      })
    }} catch (error) {
      console.error('Error parsing user data', error);
      this.router.navigate(['/login']);
    }
  }

  loadUserData(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.userData = JSON.parse(storedUser);
        this.patientId = this.userData?.Id;
        // this.userService.getUserByEmail(user.email).subscribe({
        //   next: (data) => {
        //     this.userData = data;
        //   },
        // }
      } catch (error) {
        console.error('Error parsing user data', error);
        this.router.navigate(['/login']);
      }
    }
  }

  logOut() {
      localStorage.clear();
      this.userService.SetLoginStatus(false);
      this.router.navigate(['/login']);
  }
}
