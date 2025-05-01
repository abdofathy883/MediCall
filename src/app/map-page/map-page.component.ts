import { Component, OnInit } from '@angular/core';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { GoogleMapService } from '../Services/google-map.service';
import { NgForm } from '@angular/forms';
import { NewVisit, VisitService } from '../Services/Visits/visit.service';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-map-page',
  imports: [GoogleMap, MapMarker, SweetAlert2Module],
  standalone: true,
  templateUrl: './map-page.component.html',
  styleUrl: './map-page.component.css',
})
export class MapPageComponent implements OnInit {
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  myLocationMarker!: google.maps.LatLngLiteral;
  nursesMarkers: google.maps.LatLngLiteral[] = [];
  availableNurses: string[] = ['Abdo', 'Abdooo'];
  zoom = 18;

  formData: NewVisit = {
    Location: {
      lat: '',
      lng: '',
    },
    ActualVisitDate: new Date(),
    ScheduledDate: new Date(),
    PatientID: '',
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
      this.loadNearbyNurses();
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

  thanksAlert() {
    Swal.fire({
      title: 'Drag me!',
      icon: 'success',
      customClass: {
        container: 'swal-alert'
      }
    });
  }
}
