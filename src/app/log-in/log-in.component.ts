import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import {
  UserManagementService,
  UserLogin,
} from '../Services/user-management.service';
import { FormsModule } from '@angular/forms';
import { CoockiesService } from '../Services/Cookies/coockies.service';

@Component({
  selector: 'app-log-in',
  imports: [RouterLink, FormsModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css',
})
export class LogInComponent {
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private userService: UserManagementService,
    private cookiesService: CoockiesService,
    private router: Router
  ) {}

  userLogin: UserLogin = {
    email: '',
    password: '',
  };

  onSubmit() {
    if (this.userLogin.email && this.userLogin.password) {
      this.loading = true;
      this.errorMessage = '';

      this.userService.sendUserLoginData(this.userLogin).subscribe({
        next: (response: any) => {
          console.log('Login response:', response); // Log the full response

          // The response is the direct object from the API, not wrapped in a data property
          if (response) {
            const {
              token,
              refreshToken,
              refreshTokenExpiration,
              email,
              userName,
              roles,
            } = response;

            // Store auth data
            localStorage.setItem('token', token);
            if (refreshToken) {
              this.cookiesService.setCookie('refreshToken', refreshToken, 1);
            }

            // Store user data
            const user = {
              email,
              userName,
              role: Array.isArray(roles) && roles.length > 0 ? roles[0] : 
                    (typeof roles === 'string' ? roles : 'User')
            } 

            localStorage.setItem('user', JSON.stringify(user));

            // Update login status
            this.userService.SetLoginStatus(true);

            // Check if roles is an array before using includes
            if (Array.isArray(roles)) {
              if (roles.includes('Nurse')) {
                this.router.navigate(['/my-account']);
              } else if (roles.includes('Patient')) {
                this.router.navigate(['/my-account']);
              } else {
                this.router.navigate(['/']);
              }
            } else if (typeof roles === 'string') {
              // If roles is a string, do a direct comparison
              if (roles === 'Nurse') {
                this.router.navigate(['/nurse-dashboard']);
              } else if (roles === 'Patient') {
                this.router.navigate(['/patient-dashboard']);
              } else {
                this.router.navigate(['/']);
              }
            } else {
              // Default navigation if roles is neither an array nor a string
              this.router.navigate(['/']);
            }
          } else {
            this.errorMessage = 'Invalid response from server';
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error logging in user', error);
          this.loading = false;

          if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage =
              'An error occurred during login. Please try again.';
          }
        },
      });
    } else {
      this.errorMessage = 'Please fill in both email and password!';
    }
  }}