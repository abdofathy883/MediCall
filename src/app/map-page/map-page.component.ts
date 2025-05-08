import {
  Patient,
  UserManagementService,
} from './../Services/user-management.service';
import { Component, inject, OnInit } from '@angular/core';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { GoogleMapService } from '../Services/google-map.service';
import {
  FormGroup,
  FormBuilder,
  NgForm,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import {
  NewVisit,
  NurseDetailsDto,
  RequestNearNursesDTO,
  ResponseNearNursesDTO,
  ServiceDto,
  VisitService,
} from '../Services/Visits/visit.service';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';
import { PaymentService } from '../Services/Payment/payment.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map-page',
  imports: [
    GoogleMap,
    MapMarker,
    SweetAlert2Module,
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
  ],
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
  availableNurses: NurseDetailsDto[] = [];
  availableServices: ServiceDto[] = [];
  zoom = 18;
  formSubmitted: boolean = false;
  nurseGotAccepted: boolean = false;
  iframeUrl!: SafeResourceUrl;
  isUserLoggedIn: boolean = false;
  isLoading: boolean = false;
  currentVisitId?: number;
  selectedNurseId?: string;

  isUserNurse: boolean = false;
  isUserPatient: boolean = false;

  VisitForm!: FormGroup;

  initializeForm() {
    this.VisitForm = this.fb.group({
      servicesIds: [[], [Validators.required]],
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
    this.isUserLoggedIn = this.userService.userValue !== null;
    this.isUserNurse = this.userService.isNurse();
    this.isUserPatient = this.userService.isPatient();

    // Load available services
    this.loadServices();

    this.initializeForm();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        this.myLocationMarker = { ...this.center };

        this.mapService
          .sendMyLocation(this.center.lat, this.center.lng)
          .subscribe({
            next: () => {
              console.log('Location sent!');
            },
            error: (error) => {
              console.error('Error sending location:', error);
            },
          });
        // get nearby drivers
        this.loadNearbyNurses();
      },
      (error) => {
        console.error('Error getting location:', error);
        this.showErrorAlert(
          'Unable to get your location. Please enable location services and try again.'
        );
      }
    );
  }

  loadServices() {
    this.isLoading = true;
    this.visit.getServices().subscribe({
      next: (services: ServiceDto[]) => {
        console.log(services);
        console.log('Response type:', typeof services);
        if (Array.isArray(services)) {
          this.availableServices = services;
        }
        // this.isLoading = false;
        console.log('Loaded services:', services);
      },
      error: (error) => {
        console.error('Error loading services:', error);
        this.isLoading = false;
        this.showErrorAlert(
          'Failed to load available services. Please try again later.'
        );
        this.availableServices = [];
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  ngOnDestroy() {
    this.isLoading = false;
  }

  loadNearbyNurses() {
    this.mapService
      .getNearbyNurses(this.center.lat, this.center.lng)
      .subscribe({
        next: (drivers) => {
          this.nursesMarkers = drivers.map((d) => ({
            lat: d.latitude,
            lng: d.longitude,
          }));
        },
        error: (error) => {
          console.error('Error loading nearby nurses:', error);
        },
      });
  }

  async onSubmit() {
    if (!this.isUserLoggedIn) {
      this.showErrorAlert('سجل دخول اولا لطلب زيارة');
      return;
    }

    // if (!this.isUserNurse) {
    //   this.showErrorAlert('المرضى فقط من يمكنهم طلب زيارة');
    //   return;
    // }

    if (this.VisitForm.invalid) {
      this.showErrorAlert('يجب اختيار خدمة واحدة على الاقل');
      return;
    }

    this.isLoading = true;


    try {
      const location = await this.getLocationForVisit();

      // Prepare the visit data according to the API requirements
      const visitData: RequestNearNursesDTO = {
        patientId: this.userService.userValue?.nationalId || '',
        patientLocation: location,
        servicesIds: this.VisitForm.get('servicesIds')?.value,
      };

      console.log('Sending visit data:', visitData);

      this.visit.sendVisitData(visitData).subscribe({
        next: (response: ResponseNearNursesDTO) => {
          console.log('Visit request submitted successfully:', response);
          console.log(JSON.stringify(response));
          this.formSubmitted = true;
          this.isLoading = false;

          this.currentVisitId = response.visit?.id;
          this.availableNurses = response.nurses || [];
          if (response.success) {

            // Update nurse markers on the map
            if (this.availableNurses.length > 1) {
              // If we have nurse locations, we could add them to the map
              // This would require the backend to return nurse locations


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
            }
          } 
        },
        error: (error) => {
          console.error('Error submitting visit request:', error);
          this.isLoading = false;

          // Show error message
          this.showErrorAlert('لم يتم ارسال طلبك. يرجى المحاولة مرة أخرى.');
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
  showErrorAlert(message: string) {
    Swal.fire({
      title: 'حدث خطأ!',
      text: message,
      icon: 'error',
      confirmButtonText: 'حسنا',
      customClass: {
        container: 'swal-alert',
      },
    });
  }

  selectNurse(nurseId: string, visitId?: number) {
    visitId = this.currentVisitId;
    if (!visitId) {
      this.showErrorAlert('No visit ID available');
      return;
    }

    debugger;
    this.selectedNurseId = nurseId;
    // this.currentVisitId = visitId;

    Swal.fire({
      title: 'تأكيد اختيار الممرض',
      text: 'هل أنت متأكد من اختيار هذا الممرض؟',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم',
      cancelButtonText: 'إلغاء',
    }).then((result) => {
      if (result.isConfirmed) {
        this.acceptNurse();
      }
    });
  }

  acceptNurse() {
    if (!this.selectedNurseId || !this.currentVisitId) {
      this.showErrorAlert('No nurse or visit selected');
      return;
    }

    this.isLoading = true;
    this.visit
      .acceptNurseByPatient(this.currentVisitId, this.selectedNurseId)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.nurseGotAccepted = true;

          if (response.payment) {
            const url = `https://accept.paymobsolutions.com/api/acceptance/iframes/${response.payment.iframeId}?payment_token=${response.payment.paymentKey}`;
            this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          } else if (response.paymentError) {
            console.error('Payment error:', response.paymentError);
            Swal.fire({
              title: 'تم قبول الممرض',
              text: 'تم قبول الممرض بنجاح ولكن هناك مشكلة في الدفع. سيتم التواصل معك قريبًا.',
              icon: 'warning',
              confirmButtonText: 'حسنا',
            });
          } else {
            this.nurseAccepted();
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error accepting nurse:', error);
          this.showErrorAlert(
            'حدث خطأ أثناء قبول الممرض. يرجى المحاولة مرة أخرى.'
          );
        },
      });
  }

  nurseAccepted() {
    this.nurseGotAccepted = true;
    this.isLoading = true;

    this.paymentService.getIframeData().subscribe({
      next: (data) => {
        this.isLoading = false;
        if (data && data.iframeId && data.paymentKey) {
          const url = `https://accept.paymobsolutions.com/api/acceptance/iframes/${data.iframeId}?payment_token=${data.paymentKey}`;
          this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        } else {
          console.error('Invalid payment data received:', data);
          this.showErrorAlert(
            'Could not process payment. Please try again later.'
          );
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error getting payment iframe data:', error);
        this.showErrorAlert(
          'Failed to initialize payment. Please try again later.'
        );
      },
    });
  }

  cancelVisit(visitId: number) {
    Swal.fire({
      title: 'سبب الإلغاء',
      input: 'text',
      inputPlaceholder: 'يرجى ذكر سبب الإلغاء',
      showCancelButton: true,
      confirmButtonText: 'إلغاء الزيارة',
      cancelButtonText: 'تراجع',
      inputValidator: (value) => {
        if (!value) {
          return 'يرجى ذكر سبب الإلغاء';
        }
        return null;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.visit.cancelVisitByPatient(visitId, result.value).subscribe({
          next: (response) => {
            this.isLoading = false;
            Swal.fire({
              title: 'تم إلغاء الزيارة',
              icon: 'success',
              confirmButtonText: 'حسنا',
            });
            this.formSubmitted = false;
            this.nurseGotAccepted = false;
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error cancelling visit:', error);
            this.showErrorAlert(
              'حدث خطأ أثناء إلغاء الزيارة. يرجى المحاولة مرة أخرى.'
            );
          },
        });
      }
    });
  }

  completeVisit(visitId: number) {
    Swal.fire({
      title: 'إنهاء الزيارة',
      text: 'هل أنت متأكد من إنهاء الزيارة؟',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم',
      cancelButtonText: 'لا',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.visit.completeVisitByPatient(visitId).subscribe({
          next: (response) => {
            this.isLoading = false;
            Swal.fire({
              title: 'تم إنهاء الزيارة',
              icon: 'success',
              confirmButtonText: 'حسنا',
            });
            this.formSubmitted = false;
            this.nurseGotAccepted = false;
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error completing visit:', error);
            this.showErrorAlert(
              'حدث خطأ أثناء إنهاء الزيارة. يرجى المحاولة مرة أخرى.'
            );
          },
        });
      }
    });
  }
}
