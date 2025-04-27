import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, map, of, catchError, throwError, tap } from 'rxjs';
import { 
  User, 
  AuthResponse, 
  LoginRequest, 
  RegisterPatientRequest, 
  RegisterNurseRequest 
} from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  baseUrl = 'http://localhost:5004/api/auth/';
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();
  

  currentUser = signal<User | null>(null);
  
  constructor() {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.userSubject.next(user);
        this.currentUser.set(user);
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }

  public get userValue(): User | null {
    return this.userSubject.value;
  }

  public isLoggedIn(): boolean {
    return !!this.userValue && !!localStorage.getItem('token');
  }

  public isNurse(): boolean {
    return this.userValue?.role === 'Nurse';
  }

  public isPatient(): boolean {
    return this.userValue?.role === 'Patient';
  }

  login(values: LoginRequest): Observable<User> {
    let params = new HttpParams();
    params = params.append('useCookies', true);
    
    return this.http.post<AuthResponse>(this.baseUrl + 'login', values, { params }).pipe(
      map(response => {
        if (response && response.token) {
          const { user, token } = response;
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('token', token);
          
          this.userSubject.next(user);
          this.currentUser.set(user);
          return user;
        }
        throw new Error('Invalid response format');
      }),
      catchError(error => {
        console.error('Login error', error);
        return throwError(() => error);
      })
    );
  }

  registerPatient(values: RegisterPatientRequest): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'register/patient', values).pipe(
      catchError(error => {
        console.error('Registration error', error);
        return throwError(() => error);
      })
    );
  }

  registerNurse(values: RegisterNurseRequest): Observable<any> {
    // Create FormData for file uploads
    const formData = new FormData();
    
    // Add all text fields
    Object.keys(values).forEach(key => {
      if (key !== 'verificationDocuments' && key !== 'location') {
        formData.append(key, values[key as keyof RegisterNurseRequest] as string);
      }
    });
    
    // Add location as JSON
    formData.append('location', JSON.stringify(values.location));
    
    // Add verification documents
    if (values.verificationDocuments) {
      // Add each document with its type
      if (values.verificationDocuments.license) {
        formData.append('verificationDocuments.license', values.verificationDocuments.license);
      }
      
      if (values.verificationDocuments.graduationCertificate) {
        formData.append('verificationDocuments.graduationCertificate', values.verificationDocuments.graduationCertificate);
      }
      
      if (values.verificationDocuments.criminalRecord) {
        formData.append('verificationDocuments.criminalRecord', values.verificationDocuments.criminalRecord);
      }
      
      if (values.verificationDocuments.syndicateCard) {
        formData.append('verificationDocuments.syndicateCard', values.verificationDocuments.syndicateCard);
      }
    }
    
    return this.http.post<any>(this.baseUrl + 'register/nurse', formData).pipe(
      catchError(error => {
        console.error('Nurse registration error', error);
        return throwError(() => error);
      })
    );
  }

  getUserInfo(): Observable<User> {
    return this.http.get<User>(this.baseUrl + 'account/my-account').pipe(
      tap(user => {
        this.userSubject.next(user);
        this.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      }),
      catchError(error => {
        console.error('Get user info error', error);
        // If 401 Unauthorized, logout the user
        if (error.status === 401) {
          this.logout();
        }
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<any> {
    // Call the backend to invalidate the refresh token
    return this.http.post(this.baseUrl + 'logout', {}).pipe(
      tap(() => {
        // Remove user from local storage and clear current user value
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        this.userSubject.next(null);
        this.currentUser.set(null);
        this.router.navigate(['/account/login']);
      }),
      catchError(error => {
        // Even if the server call fails, clear local data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        this.userSubject.next(null);
        this.currentUser.set(null);
        this.router.navigate(['/account/login']);
        return of(null);
      })
    );
  }

  getAuthorizationToken(): string | null {
    return localStorage.getItem('token');
  }
}
