import { User } from './../Services/user-management.service';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GoogleMapService } from '../Services/google-map.service';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import {
  RequestNearNursesDTO,
  ResponseNearNursesDTO,
  NurseDetailsDto,
  ServiceDto,
  VisitService,
} from '../Services/Visits/visit.service';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';
import { PaymentService } from '../Services/Payment/payment.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { UserManagementService } from '../Services/user-management.service';
@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    GoogleMap,
    MapMarker,
    SweetAlert2Module,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private visit = inject(VisitService);
  private userService = inject(UserManagementService);
  private sanitizer = inject(DomSanitizer);
  private fb = inject(FormBuilder);
  private mapService = inject(GoogleMapService);

  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  myLocationMarker!: google.maps.LatLngLiteral;
  nursesMarkers: google.maps.LatLngLiteral[] = [];
  availableNurses: NurseDetailsDto[] = [];
  availableServices: ServiceDto[] = [];
  zoom = 18;

  formSubmitted: boolean = false;
  nurseGotAccepted: boolean = false;

  isUserLoggedIn: boolean = false;
  isLoading: boolean = false;
  currentVisitId?: number;
  selectedNurseId?: string;

  isUserNurse: boolean = false;
  isUserPatient: boolean = false;

  VisitForm!: FormGroup;

  // formData: NewVisit = {
  //   patientId: '',
  //   PatientLocation: {
  //     lat: 0,
  //     lng: 0,
  //   },
  //   servicesIds: []
  // };

  initializeForm() {
    this.VisitForm = this.fb.group({
      servicesIds: [[], [Validators.required]],
    });
  }

  private getLocationForVisit(): Promise<google.maps.LatLngLiteral> {
    return new Promise<google.maps.LatLngLiteral>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          resolve(location);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  loadServices() {
    this.isLoading = true;
    this.visit.getServices().subscribe({
      next: (services: ServiceDto[]) => {
        this.availableServices = services;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching services:', error);
        this.isLoading = false;
      },
    });
  }

  ngOnInit(): void {
    this.isUserLoggedIn = this.userService.userValue !== null;
    this.isUserNurse = this.userService.isNurse();
    this.isUserPatient = this.userService.isPatient();

    this.loadServices();
    this.initializeForm();

    navigator.geolocation.getCurrentPosition((position) => {
      this.center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      this.myLocationMarker = { ...this.center };
      this.mapService
        .sendMyLocation(this.center.lat, this.center.lng)
        .subscribe(() => {
          console.log('Location sent!');
        });
      // get nearby drivers
      this.loadNearbyDrivers();
    });
  }

  loadNearbyDrivers() {
    this.mapService.getNearbyNurses(this.center.lat, this.center.lng).subscribe(
      (nurses) => {
        this.nursesMarkers = nurses.map((d) => ({
          lat: d.latitude,
          lng: d.longitude,
        }));
      },
      (error) => {
        console.error('Error loading nearby drivers:', error);
      }
    );
  }

  showErrorAlert(message: string) {
    Swal.fire({
      title: 'حدث خطأ!',
      text: message,
      icon: 'error',
      confirmButtonText: 'حسنا',
    });
  }

 async onSubmit() {
  if (!this.isUserLoggedIn) {
    this.showErrorAlert('يجب عليك تسجيل الدخول أولا');
    return;
  }

  if (!this.isUserPatient) {
    this.showErrorAlert('يجب أن تكون حاليا مريضا لتستطيع إرسال طلبك');
    return;
  }

  if (this.VisitForm.invalid) {
    this.showErrorAlert('يجب عليك اختيار خدماتك');
    return;
  }

  this.isLoading = true;

  try {
    const location = await this.getLocationForVisit();

    const visitData: RequestNearNursesDTO = {
      patientId: this.userService.userValue?.userName || '',
      patientLocation: location,
      servicesIds: this.VisitForm.get('servicesIds')?.value,
    };

    this.visit.sendVisitData(visitData).subscribe({
      next: (response) => {
        this.formSubmitted = true;
        this.isLoading = false;
        this.VisitForm.reset();

        if (response.success) {
          this.currentVisitId = response.visit?.id;
          // this.availableNurses = response.availableNurses || [];

          Swal.fire({
            title: 'تم ارسال طلبك بنجاح!',
            text:
              this.availableNurses.length > 0
                ? 'يرجى اختيار ممرض من القائمة'
                : 'لا يوجد ممرضين متاحين حاليًا',
            icon: 'success',
            confirmButtonText: 'تم',
            customClass: {
              container: 'swal-alert',
            },
          });
        } else {
          this.showErrorAlert('حدث خطأ أثناء إرسال الطلب');
        }
      },
      error: (error) => {
        console.error('Error submitting form:', error);
        this.isLoading = false;
        this.showErrorAlert('لم يتم ارسال طلبك, يرجى المحاولة مرة اخرى');
      },
    });
  } catch (error) {
    console.error('Error getting location:', error);
      this.isLoading = false;
      this.showErrorAlert(
        'Unable to get your location. Please enable location services and try again.'
      );
  }
  }

  thanksAlert(): void {}
}
