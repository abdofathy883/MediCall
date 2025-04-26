import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserManagementService, UserLogin } from '../Services/user-management.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-log-in',
  imports: [RouterLink, FormsModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogInComponent {

  constructor(private userService: UserManagementService) { }
  userLogin: UserLogin = {
    email: '',
    password: ''
  };

  onSubmit() {
    this.userService.sendUserLoginData(this.userLogin).subscribe({
      next: (response) => {
        console.log('User logged in successfully', response);
        alert('User logged in successfully!');
      },
      error: (error) => {
        console.error('Error logging in user', error);
      },
    });
  }
}
