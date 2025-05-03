import { VisitService } from './../Services/Visits/visit.service';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GoogleMapService } from '../Services/google-map.service';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { NewVisit } from '../Services/Visits/visit.service';
import { NgForm } from '@angular/forms';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
@Component({
  selector: 'app-home',
  imports: [RouterLink, GoogleMap, MapMarker],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  myLocationMarker!: google.maps.LatLngLiteral;
  driverMarkers: google.maps.LatLngLiteral[] = [];
  zoom = 18;

  formData: NewVisit = {
    PatientLocation: {
      lat: 0,
      lng: 0,
    },
    ActualVisitDate: new Date(),
    ScheduledDate: new Date(),
    PatientID: '',
    Service: '',
  };

  constructor(
    private mapService: GoogleMapService,
    private visit: VisitService
  ) {}
  ngOnInit(): void {
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
    this.mapService
      .getNearbyNurses(this.center.lat, this.center.lng)
      .subscribe((drivers) => {
        this.driverMarkers = drivers.map((d) => ({
          lat: d.latitude,
          lng: d.longitude,
        }));
      });
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.visit.sendVisitData(this.formData).subscribe({
        next: (response) => {
          console.log('Form submitted successfully:', response);
          form.reset(); // Reset the form after successful submission

          // Optionally, you can show a success message to the user here
          alert('Your message has been sent successfully!');
        },
        error: (error) => {
          console.error('Error submitting form:', error);
        },
      });
    }
  }

  thanksAlert(): void{
    
  }
}
