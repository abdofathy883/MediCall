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
          // console.log('Login response:', response); // Log the full response

          // The response is the direct object from the API, not wrapped in a data property
          if (response.isAuthenticated) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('userEmail', response.email);
            localStorage.setItem('userId', response.Id);

            const user = {
              email: response.email,
              userName: response.userName,
              role:
                Array.isArray(response.roles) && response.roles.length > 0
                  ? response.roles[0]
                  : null,
              userId: response.userId,
            };

            localStorage.setItem('user', JSON.stringify(user));
            this.userService.SetLoginStatus(true);
            this.router.navigate(['/my-account']);
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
  }
}
