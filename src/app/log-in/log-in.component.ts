import { CoockiesService } from './../Services/Cookies/coockies.service';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserManagementService, UserLogin } from '../Services/user-management.service';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-log-in',
  imports: [RouterLink, FormsModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogInComponent {

  constructor(private userService: UserManagementService, private CoockiesService: CookieService) { }
  userLogin: UserLogin = {
    email: '',
    password: ''
  };

  onSubmit() {
    if (this.userLogin.email && this.userLogin.password) {
      this.userService.sendUserLoginData(this.userLogin).subscribe((response: any) => {
        const {token, refreshToken, refreshTokenExpiration} = response;

        localStorage.setItem('authtoken', token);
        this.CoockiesService.set('refreshToken', refreshToken, 1); 
        },
        (error) => {
          console.error('Error logging in user', error);
          alert('Error logging in user!');
        }
      );
    } else {
      alert('Please fill in both email and password!');
    }
  }
}
