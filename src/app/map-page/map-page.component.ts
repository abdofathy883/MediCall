import {
  Patient,
  UserManagementService,
} from './../Services/user-management.service';
import { Component, inject, OnInit } from '@angular/core';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { GoogleMapService } from '../Services/google-map.service';
import { FormGroup, FormBuilder, NgForm, Validators } from '@angular/forms';
import { NewVisit, VisitService } from '../Services/Visits/visit.service';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';
import { PaymentService } from '../Services/Payment/payment.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-map-page',
  imports: [GoogleMap, MapMarker, SweetAlert2Module, RouterLink],
  standalone: true,
  templateUrl: './map-page.component.html',
  styleUrl: './map-page.component.css',
})
export class MapPageComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private sanitizer = inject(DomSanitizer);
  private fb = inject(FormBuilder);
  
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  myLocationMarker!: google.maps.LatLngLiteral;
  nursesMarkers: google.maps.LatLngLiteral[] = [];
  availableNurses: string[] = ['Abdo', 'Abdooo'];
  zoom = 18;
  formSubmitted: boolean = true;
  nurseGotAccepted: boolean = true;
  iframeUrl!: SafeResourceUrl;
  isUserLoggedIn: boolean = true;

  isUserNurse: boolean = false;
  isUserPatient: boolean = false;

  VisitForm!: FormGroup;
  VisitFormValues = new FormData();

  formData: NewVisit = {
    PatientLocation: {
      lat: 0,
      lng: 0,
    },
    ActualVisitDate: new Date(),
    Service: '',
    ScheduledDate: new Date(),
    PatientID: '',
  };

  initializeForm() {
    this.VisitForm = this.fb.group({
      PatientLocation: ['', [Validators.required]],
      ActualVisitDate: ['', [Validators.required]],
      ScheduledDate: ['', [Validators.required]],
      Service: ['', [Validators.required]],
      PatientID: ['', [Validators.required]],
    });
  }

  private getLocationForVisit(): Promise<google.maps.LatLngLiteral> {
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

  constructor(
    private mapService: GoogleMapService,
    private visit: VisitService,
    private userService: UserManagementService
  ) {}
  ngOnInit(): void {
    this.visit.getNearestNurses().subscribe((nurses: string[]) => {
      this.availableNurses = nurses;
    });

    this.visit.getServices().subscribe((services: any[]) => {
      this.availableNurses = services;
    });

    this.initializeForm();
    this.getLocationForVisit();
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
      this.loadNearbyNurses();

      if (this.userService.isLoggedIn) {
        this.isUserLoggedIn = true;
      }

      if (this.userService.isNurse()) {
        this.isUserNurse = true;
      }

      if (this.userService.isPatient()) {
        this.isUserPatient = true;
      }
    });
  }

  loadNearbyNurses() {
    this.mapService
      .getNearbyNurses(this.center.lat, this.center.lng)
      .subscribe((drivers) => {
        this.nursesMarkers = drivers.map((d) => ({
          lat: d.latitude,
          lng: d.longitude,
        }));
      });
  }

  async onSubmit(form: NgForm) {
    const currentLocation = await this.getLocationForVisit();
    const locationData = {
      Lat: currentLocation.lat,
      Lng: currentLocation.lng,
    };

    if (this.VisitForm.valid) {
      try {
        const location = await this.getLocationForVisit();

        this.VisitFormValues.append(
          'service',
          this.VisitForm.get('service')?.value
        );
        //Date and Time
        this.VisitFormValues.append(
          'service',
          this.VisitForm.get('service')?.value
        );

        this.VisitFormValues.append(
          'Location.Lat',
          currentLocation.lat.toString()
        );
        this.VisitFormValues.append(
          'Location.Lng',
          currentLocation.lng.toString()
        );
        this.visit.sendVisitData(this.formData).subscribe({
          next: (response) => {
            console.log('Form submitted successfully:', response);
            form.reset(); // Reset the form after successful submission
            this.formSubmitted = true;
            // Optionally, you can show a success message to the user here
            alert('Your message has been sent successfully!');
          },
          error: (error) => {
            console.error('Error submitting form:', error);
          },
        });
      } catch (error) {
        console.error(error);
      }
    }
  }

  thanksAlert() {
    Swal.fire({
      title: 'تم ارسال طلبك بنجاح!',
      icon: 'success',
      confirmButtonText: 'تم',
      customClass: {
        container: 'swal-alert',
      },
    });
  }

  nurseAccepted() {
    this.nurseGotAccepted = true;
    this.paymentService.getIframeData().subscribe((data) => {
      const url = `https://accept.paymobsolutions.com/api/acceptance/iframes/${data.iframeId}?payment_token=${data.paymentKey}`;
      this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });
  }
}
