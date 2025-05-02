import { CoockiesService } from './../Services/Cookies/coockies.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserManagementService } from '../Services/user-management.service';

@Component({
  selector: 'app-my-account',
  imports: [],
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.css'
})
export class MyAccountComponent implements OnInit {
  userData: any;
  userID: string = '';
  visits: any[] = [];
  constructor(private router: Router, private userService: UserManagementService, private cookiesService: CoockiesService) { }

  ngOnInit(): void {
    if(!this.userService.isLoggedIn){
      this.router.navigate(['/login']);
      return;
    }

    this.userID = localStorage.getItem('userID') || '';

    if(this.userID){
      this.userService.getUserDataByID(this.userID).subscribe({
        next: (data) => this.userData = data,
        error: (err) => console.error(`Error fetching user`, err)
      })
    }

    this.userService.getVisits().subscribe({
      next: (data) => this.visits = data,
      error: (err) => console.error(`Error fetching visits`, err)
    })
  }
  // Add any methods or properties you need for your component here
  // For example, you might want to fetch user data from a service and display it in the template
  logOut() {
    localStorage.removeItem('authtoken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userLocationLat');
    localStorage.removeItem('userLocationLng');
    this.cookiesService.deleteCookie('refreshToken'); // Delete the refresh token cookie
    // this.userService.isLoggedIn.next(false); // Update the login status in the service
    // Optionally, you can redirect to the login page or home page after logout
    this.router.navigate(['/login']);
  }
}
