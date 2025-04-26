import { NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Component } from '@angular/core';
import {
  UserManagementService,
  UserRegister,
  Location,
} from '../Services/user-management.service';

@Component({
  selector: 'app-register',
  imports: [RouterLink],
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

  constructor(private userManagementService: UserManagementService) {
    this.user.userName = `${this.user.firstName} ${this.user.lastName}`;
  }

  // onSubmit(form: NgForm) {
  //   if (form.valid) {
  //     this.userManagementService.registerUser(this.user).subscribe({
  //       next: (response) => {
  //         console.log('User registered successfully', response);
  //         alert('User registered successfully!');
  //         form.reset(); // Reset the form after successful registration
  //       },
  //       error: (error) => {
  //         console.error('Error registering user', error);
  //       },
  //     });
  //   }
  // }
}
