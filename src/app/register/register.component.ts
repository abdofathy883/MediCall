import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Component } from '@angular/core';
import {
  UserManagementService,
  UserRegister,
  Location,
  
} from '../Services/user-management.service';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule],
  standalone: true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  user: UserRegister = {
    nationalId: '',
    email: '',
    userName: '',
    password: '',
    confirmPassword: '',
    phone: '',
    firstName: '',
    lastName: '',
    Role: '',
    dateOfBirth: new Date(),
    gender: '',
    location: { Lat: 0, Lng: 0 },
  };

  getUserLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser."));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            alert("You need to allow location access to proceed.");
            window.location.reload(); // Refresh the page
          } else {
            reject(error); // Other errors
          }
        });
        
      }
    });
  }
  constructor(private userManagementService: UserManagementService, private router: Router) {
    this.user.userName = `${this.user.firstName} ${this.user.lastName}`;
    dateOfBirth: new Date(this.user.dateOfBirth).toISOString().split('T')[0]; // Format date to YYYY-MM-DD
    this.getUserLocation().then(position => {
      this.user.location.Lat = position.coords.latitude;
      this.user.location.Lng = position.coords.longitude;
    }).catch(error => {
      // console.error('Error getting user location', error);
      if (error instanceof Error) {
        console.error("Error getting location:", error.message);
      }
    });
  }

  onSubmit() {
    if (this.user.password !== this.user.confirmPassword) {
      alert('Passwords do not match!');
      return;

    }
      this.userManagementService.registerUser(this.user).subscribe({
        next: (response) => {
          alert('User registered successfully!');
          this.router.navigate(['/my-account']); // Navigate to login page after successful registration
        },
        error: (error) => {
          console.error('Error registering user', error);
        },
      });
    
  }
  // onSubmit(form: NgForm) {
  //   if (form.valid) {
  //     this.userManagementService.registerUser(this.user).subscribe({
  //       next: (response) => {
  //         alert('User registered successfully!');
  //         this.router.navigate(['/my-account']); // Navigate to login page after successful registration
  //       },
  //       error: (error) => {
  //         console.error('Error registering user', error);
  //       },
  //     });
  //   }
  // }
}
