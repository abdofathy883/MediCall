import { NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Component } from '@angular/core';
import {
  UserManagementService,
  User,
} from '../Services/user-management.service';

@Component({
  selector: 'app-register',
  imports: [RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
//   user: User = {
//     id: 1,
//     firstName: 'string',
//     lastName: 'string',
//     dateOfBirth: new Date(),
//     gender: 'string',
//     email: 'string',
//     phone: 'string',
//     createdAt: new Date(),
//   };
  // constructor(private userManagementService: UserManagementService) {}

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
