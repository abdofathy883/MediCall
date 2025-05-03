import { VisitService } from './../Services/Visits/visit.service';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  GoogleMapService,
  RequestNearNursesDTO,
  NurseDetailsDto,
  ServiceDto,
} from '../Services/google-map.service';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserManagementService } from '../Services/user-management.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, GoogleMap, MapMarker, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  myLocationMarker!: google.maps.LatLngLiteral;
  nurseMarkers: google.maps.LatLngLiteral[] = [];
  nurses: NurseDetailsDto[] = [];
  zoom = 18;
  isLoading = false;
  errorMessage = '';
  services: ServiceDto[] = [];
  showNursesList = false;

  request: RequestNearNursesDTO = {
    patientId: '',
    serviceIds: [],
    patientLocation: { lat: 0, lng: 0 },
    scheduledDate: new Date(),
    actualVisitDate: new Date(),
  };

  constructor(
    private mapService: GoogleMapService,
    private visitService: VisitService,
    private userService: UserManagementService
  ) {}

  ngOnInit(): void {
    // Access the current value of the signal
    const user = this.userService.currentUser.value;

    if (user) {
      this.request.patientId = user.id;
    } else {
      // If no user is logged in, check localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        this.request.patientId = user.id;
      }
    }

    // React to changes in the signal using effect
    this.userService.currentUser.effect((user) => {
      if (user) {
        this.request.patientId = user.id;
      } else {
        this.request.patientId = ''; // Clear patientId if user is null
      }
    });

    // Get current location
    navigator.geolocation.getCurrentPosition((position) => {
      this.center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      this.myLocationMarker = { ...this.center };
      this.request.patientLocation = { ...this.center };
    });

    // Load available services
    this.loadServices();
  }
  loadServices() {
    this.visitService.getServices().subscribe({
      next: (services) => {
        this.services = services;
      },
      error: (err) => {
        console.error('Error loading services:', err);
        this.errorMessage = 'Failed to load services. Please try again.';
      },
    });
  }

  onSubmit() {
    if (!this.request.patientId) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to request a visit',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (this.request.serviceIds.length === 0) {
      Swal.fire({
        title: 'Service Required',
        text: 'Please select at least one service',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.showNursesList = false;

    // Set actual visit date to now
    this.request.actualVisitDate = new Date();

    this.mapService.findNearestNurses(this.request).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        // Check if response has Nurses property (uppercase N)
        if (response.Nurses) {
          this.nurses = response.Nurses;
        }
        // Also check for lowercase nurses property as a fallback
        else if (response.nurses) {
          this.nurses = response.nurses;
        }
        // If the response itself is an array, use it directly
        else if (Array.isArray(response)) {
          this.nurses = response;
        } else {
          this.nurses = [];
          console.warn('Unexpected response format:', response);
        }

        // Update markers for nurses with location
        this.nurseMarkers = this.nurses
          .filter((n) => n.location && n.location.lat && n.location.lng)
          .map((n) => ({
            lat: n.location!.lat,
            lng: n.location!.lng,
          }));

        this.showNursesList = true;

        if (this.nurses.length === 0) {
          Swal.fire({
            title: 'No Nurses Available',
            text: 'No nurses are available for your request at this time.',
            icon: 'info',
            confirmButtonText: 'OK',
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error finding nurses:', err);
        this.errorMessage = 'Failed to find nurses. Please try again.';

        Swal.fire({
          title: 'Error',
          text: 'Failed to find nurses. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      },
    });
  }

  selectNurse(nurse: NurseDetailsDto) {
    // Implement nurse selection logic
    Swal.fire({
      title: 'Confirm Selection',
      text: `Do you want to select ${nurse.firstName} ${nurse.lastName} as your nurse?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        // Here you would call the API to accept this nurse
        // For now, just show a success message
        this.thanksAlert();
      }
    });
  }

  thanksAlert(): void {
    Swal.fire({
      title: 'Request Sent!',
      text: 'Your request has been sent successfully. The nurse will be notified.',
      icon: 'success',
      confirmButtonText: 'OK',
    });
  }
}
