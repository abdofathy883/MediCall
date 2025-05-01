import { Gender} from './../Services/user-management.service';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Component, inject, OnInit } from '@angular/core';
import {
  UserManagementService,
  baseUser,
} from '../Services/user-management.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private subscription = new Subscription();
  private userService = inject(UserManagementService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  registrationForm!: FormGroup;
  userType: 'patient' | 'nurse' = 'patient';

 

  ngOnInit(): void {
  //   // Redirect to home if already logged in
  //   if (this.userService.isLoggedIn()) {
  //     this.router.navigate(['/']);
  //     return;
  //   }
  this.initializeForm();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initializeForm(): void {
    this.registrationForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        dateOfBirth: ['', [Validators.required, this.validateDateOfBirth()]],
        gender: [Gender.Male, Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      {
        Validators: this.passwordMatchValidator,
      }
    );
  }
  // Password match custom validator
  private passwordMatchValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password?.pristine || confirmPassword?.pristine) {
      return null;
    }

    return password &&
      confirmPassword &&
      password.value !== confirmPassword.value
      ? { mismatch: true }
      : null;
  }

  // Date of birth validator to ensure user is at least 18 years old
  private validateDateOfBirth(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }

      const today = new Date();
      const birthDate = new Date(control.value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      return age < 18 ? { minAge: { required: 18, actual: age } } : null;
    };
  }

  getUserLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            alert('You need to allow location access to proceed.');
            window.location.reload(); // Refresh the page
          } else {
            reject(error); // Other errors
          }
        });
      }
    });
  }

  onSubmit() {
    const formValues = this.registrationForm.value;
    this.userService.registerPatient(formValues).subscribe({
      next: (response) => {
        alert('User registered successfully!');
        this.router.navigate(['/my-account']); // Navigate to login page after successful registration
      },
      error: (error) => {
        console.error('Error registering user', error);
      },
    });
  }
}
