import { Gender, Location } from './../Services/user-management.service';
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
import { UserManagementService } from '../Services/user-management.service';
import { Subscription } from 'rxjs';

interface NurseCertificate {
  CertificateId: number;
  Type: string;
  File: File | null;
  ExpirationDate: Date;
}

@Component({
  selector: 'app-register-nurse',
  imports: [RouterLink, FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './register-nurse.component.html',
  styleUrl: './register-nurse.component.css',
})
export class RegisterNurseComponent implements OnInit {
  private subscription = new Subscription();
  private userService = inject(UserManagementService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  location: Location | undefined;
  registrationForm!: FormGroup;
  registrationFormValues = new FormData();

  // File references
  licenseFile: File | null = null;
  graduationFile: File | null = null;
  criminalRecordFile: File | null = null;
  syndicateCardFile: File | null = null;
  NurseCertificates: NurseCertificate[] = [];

  private getLocationForRegister(): Promise<google.maps.LatLngLiteral> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          resolve(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          reject(error);
        }
      );
    });
  }

  ngOnInit(): void {
    this.getLocationForRegister();
    this.initializeForm();

    this.NurseCertificates = [
      { CertificateId: 1, Type: 'License', File: null, ExpirationDate: new Date(new Date().getFullYear(), 0, 1) },
      { CertificateId: 2,
        Type: 'GraduationCertificate',
        File: null,
        ExpirationDate: new Date(new Date().getFullYear(), 0, 1)
      },
      { CertificateId: 3, Type: 'CriminalRecord', File: null, ExpirationDate: new Date(new Date().getFullYear(), 0, 1) },
      { CertificateId: 4, Type: 'SyndicateCard', File: null, ExpirationDate: new Date(new Date().getFullYear(), 0, 1)}
    ]
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
        phone: ['', Validators.required],
        dateOfBirth: ['', [Validators.required, this.validateDateOfBirth()]],
        gender: [Gender.Male, Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        nationalId: ['', Validators.required],
        confirmPassword: ['', Validators.required],
        experienceYears: [0, [Validators.required, Validators.min(0)]],
        licensenumber: ['', Validators.required],
        licensefile: [null, Validators.required],
        graduation: [null, Validators.required],
        criminalRecord: [null, Validators.required],
        syndicateCard: [null, Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
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

  // File upload handlers
  onLicenseFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.setCertificateFile(1, input.files[0]);
      this.licenseFile = input.files[0];
      this.registrationForm.patchValue({ licenseFile: this.licenseFile.name });
      this.registrationForm.get('licensefile')?.markAsDirty();
    }
  }

  onGraduationFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.setCertificateFile(2, input.files[0]);
      this.graduationFile = input.files[0];
      this.registrationForm.patchValue({
        graduationFile: this.graduationFile.name,
      });
      this.registrationForm.get('graduation')?.markAsDirty();
    }
  }

  onCriminalRecordFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.setCertificateFile(3, input.files[0]);
      this.criminalRecordFile = input.files[0];
      this.registrationForm.patchValue({
        criminalRecordFile: this.criminalRecordFile.name,
      });
      this.registrationForm.get('criminalRecord')?.markAsDirty();
    }
  }

  onSyndicateCardFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.setCertificateFile(4, input.files[0]);
      this.syndicateCardFile = input.files[0];
      this.registrationForm.patchValue({
        syndicateCardFile: this.syndicateCardFile.name,
      });
      this.registrationForm.get('syndicateCard')?.markAsDirty();
    }
  }

  private setCertificateFile(certId: number, file: File): void {
    const cert = this.NurseCertificates.find(c => c.CertificateId === certId);
    if (cert) {
      cert.File = file;
    }
  }
  

  async onSubmit() {
    if (this.registrationForm.valid) {
      try {
        const currentLocation = await this.getLocationForRegister();
        const locationData = {
          Lat: currentLocation.lat,
          Lng: currentLocation.lng,
        };

        // Create a new FormData object
        const formData = new FormData();
        const location = await this.getLocationForRegister();

        // Add basic nurse information
        formData.append(
          'firstName',
          this.registrationForm.get('firstName')?.value
        );
        formData.append(
          'lastName',
          this.registrationForm.get('lastName')?.value
        );
        formData.append('email', this.registrationForm.get('email')?.value);
        formData.append('userName', this.registrationForm.get('email')?.value);
        formData.append(
          'phoneNumber',
          this.registrationForm.get('phone')?.value
        );
        formData.append(
          'dateOfBirth',
          this.registrationForm.get('dateOfBirth')?.value
        );
        formData.append('gender', this.registrationForm.get('gender')?.value);
        formData.append(
          'password',
          this.registrationForm.get('password')?.value
        );
        formData.append(
          'confirmPassword',
          this.registrationForm.get('confirmPassword')?.value
        );
        formData.append(
          'nationalId',
          this.registrationForm.get('nationalId')?.value
        );
        formData.append(
          'licensenumber',
          this.registrationForm.get('licensenumber')?.value
        );

        formData.append(
          'Location.Lat',
          currentLocation.lat.toString()
        );
        formData.append(
          'Location.Lng',
          currentLocation.lng.toString()
        );

        // Add file uploads
        for (let i = 0; i < this.NurseCertificates.length; i++) {
          const cert = this.NurseCertificates[i];
          if (cert.File) {
            formData.append(
              `NurseCertificates[${i}].File`,
              cert.File,
              cert.File.name
            );
            formData.append(`NurseCertificates[${i}].Type`, cert.Type);
            formData.append(
              `NurseCertificates[${i}].CertificateId`,
              cert.CertificateId.toString()
            );
            formData.append(`NurseCertificates[${i}].ExpirationDate`, cert.ExpirationDate?.toISOString() || '');
          }
        }

        
        // Call the service to register the nurse
        this.userService.registerNurse(formData).subscribe({
          next: (response) => {
            alert('Nurse registered successfully!');
            this.router.navigate(['/login']);
          },
          error: (error) => {
            console.error('Error registering nurse:', error);
            alert(
              'Registration failed: ' +
                (error.error?.message || 'Unknown error')
            );
          },
        });
      } catch (error) {
        console.error('Error during registration:', error);
        alert('An error occurred during registration. Please try again.');
      }
    }
  }
}
