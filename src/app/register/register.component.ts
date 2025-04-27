import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidatorFn
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../shared/servics/account.service';
import { Gender, RegisterNurseRequest, VerificationDocumentType } from '../shared/models/user';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private router = inject(Router);

  registerForm!: FormGroup;
  userType: 'patient' | 'nurse' = 'patient';
  loading = false;
  submitted = false;
  showPassword = false;
  showConfirmPassword = false;
  errorMessage = '';
  
  // Verification documents
  licenseFile: File | null = null;
  graduationCertificateFile: File | null = null;
  criminalRecordFile: File | null = null;
  syndicateCardFile: File | null = null;
  
  // Geolocation
  isGettingLocation = false;
  locationError = '';
  
  private subscription = new Subscription();
  
  // Enum for template usage
  genderEnum = Gender;
  docTypeEnum = VerificationDocumentType;

  ngOnInit(): void {
    // Redirect to home if already logged in
    if (this.accountService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: ['', [Validators.required, this.validateDateOfBirth()]],
      gender: [Gender.Male, Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      location: this.fb.group({
        city: ['', Validators.required],
        address: ['', Validators.required],
        postalCode: [''],
        latitude: [null],
        longitude: [null]
      })
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Password match custom validator
  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password?.pristine || confirmPassword?.pristine) {
      return null;
    }
    
    return password && confirmPassword && password.value !== confirmPassword.value ? 
      { 'mismatch': true } : null;
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
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age < 18 ? { 'minAge': { required: 18, actual: age } } : null;
    };
  }

  // Convenience getter for form fields
  get f() {
    return this.registerForm.controls;
  }

  get locationControls() {
    return (this.registerForm.get('location') as FormGroup).controls;
  }

  switchUserType(type: 'patient' | 'nurse'): void {
    this.userType = type;
  }

  onFileChange(event: any, documentType: VerificationDocumentType): void {
    if (event.target.files && event.target.files.length) {
      const file = event.target.files[0] as File;
      
      switch (documentType) {
        case VerificationDocumentType.License:
          this.licenseFile = file;
          break;
        case VerificationDocumentType.GraduationCertificate:
          this.graduationCertificateFile = file;
          break;
        case VerificationDocumentType.CriminalRecord:
          this.criminalRecordFile = file;
          break;
        case VerificationDocumentType.SyndicateCard:
          this.syndicateCardFile = file;
          break;
      }
    }
  }
  
  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.locationError = 'Geolocation is not supported by your browser';
      return;
    }
    
    this.isGettingLocation = true;
    this.locationError = '';
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationGroup = this.registerForm.get('location') as FormGroup;
        locationGroup.patchValue({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        this.isGettingLocation = false;
      },
      (error) => {
        this.locationError = this.getGeolocationErrorMessage(error);
        this.isGettingLocation = false;
      }
    );
  }
  
  private getGeolocationErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'User denied the request for Geolocation.';
      case error.POSITION_UNAVAILABLE:
        return 'Location information is unavailable.';
      case error.TIMEOUT:
        return 'The request to get user location timed out.';
      default:
        return 'An unknown error occurred.';
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  
  areAllVerificationFilesProvided(): boolean {
    return !!(
      this.licenseFile && 
      this.graduationCertificateFile && 
      this.criminalRecordFile && 
      this.syndicateCardFile
    );
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    // Stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;

    // Copy form values
    const formValues = { ...this.registerForm.value };

    if (this.userType === 'nurse') {
      if (!this.areAllVerificationFilesProvided()) {
        this.errorMessage = 'يرجى تحميل جميع المستندات المطلوبة للتحقق';
        this.loading = false;
        return;
      }

      // Add verification documents for nurse
      const nurseData: RegisterNurseRequest = {
        ...formValues,
        verificationDocuments: {
          license: this.licenseFile!,
          graduationCertificate: this.graduationCertificateFile!,
          criminalRecord: this.criminalRecordFile!,
          syndicateCard: this.syndicateCardFile!
        }
      };

      this.subscription.add(
        this.accountService.registerNurse(nurseData).subscribe({
          next: () => {
            this.router.navigate(['/account/login'], { 
              queryParams: { registered: true, userType: 'nurse' } 
            });
          },
          error: error => {
            console.error('Registration failed', error);
            this.errorMessage = error.error?.message || 'فشل التسجيل. يرجى المحاولة مرة أخرى.';
            this.loading = false;
          },
          complete: () => this.loading = false
        })
      );
    } else {
      // Patient registration
      this.subscription.add(
        this.accountService.registerPatient(formValues).subscribe({
          next: () => {
            this.router.navigate(['/account/login'], { 
              queryParams: { registered: true, userType: 'patient' }
            });
          },
          error: error => {
            console.error('Registration failed', error);
            this.errorMessage = error.error?.message || 'فشل التسجيل. يرجى المحاولة مرة أخرى.';
            this.loading = false;
          },
          complete: () => this.loading = false
        })
      );
    }
  }
}
