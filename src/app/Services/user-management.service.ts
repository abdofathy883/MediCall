import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Observable,
  BehaviorSubject,
  catchError,
  of,
  tap,
  throwError,
  map,
} from 'rxjs';
import { Router } from '@angular/router';

export enum Gender {
  Male = 0,
  Female = 1,
}

export interface Location {
  Lat: number;
  Lng: number;
}

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ChatReference {
  id: string;
  chatId: string;
}

export interface VerificationDocument {
  type: VerificationDocumentType;
  file: File;
}

export enum VerificationDocumentType {
  License = 'License',
  GraduationCertificate = 'GraduationCertificate',
  CriminalRecord = 'CriminalRecord',
  SyndicateCard = 'SyndicateCard',
}

export interface RefreshToken {
  token: string;
  expires: Date;
  created: Date;
  revoked?: Date;
}

export interface baseUser {
  Id?: string;
  nationalId: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date;
  gender: Gender;
  Location: Location;
  password: string;
  confirmPassword: string;
  phone: string;
  createdAt: Date;
}

export interface Patient extends baseUser {
  // patientId: string;
  role: 'Patient';
}

export interface Nurse extends baseUser {
  role: 'Nurse';
  verificationDocuments: string[];
  isVerified: boolean;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface RegisterPatientRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: Date;
  gender: Gender;
  profilePicture?: string;
  location: Location;
}

export interface RegisterNurseRequest extends baseUser {
  LicenseNumber: string;
  Experience: Number;
  verificationDocuments: {
    license: File;
    graduationCertificate: File;
    criminalRecord: File;
    syndicateCard: File;
  };
}

export type User = Patient | Nurse;

export interface AuthResponse {
  patientId: string;
  isAuthenticated: boolean;
  token: string;
  email: string;
  userName: string;
  roles: string[] | string;
  message?: string;
  refreshToken?: string;
  refreshTokenExpiration?: Date;
  userId: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  private LoggedIn = new BehaviorSubject<boolean>(false);
  private apiURL = 'http://localhost:5004/api/auth'; // Replace with your API endpoint

  private loggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn = this.loggedInSubject.asObservable();

  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredUser();
  }

  public SetLoginStatus(status: boolean): void {
    this.loggedInSubject.next(status);
  }

  public get userValue(): User | null {
    return this.userSubject.value;
  }

  public isNurse(): boolean {
    return this.userValue?.role === 'Nurse';
  }

  public isPatient(): boolean {
    return this.userValue?.role === 'Patient';
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

  getAuthorizationToken(): string | null {
    return localStorage.getItem('token');
  }

  registerPatient(values: any): Observable<any> {
    console.log(values);
    return this.http.post<any>(this.apiURL + '/PatientRegister', values).pipe(
      catchError((error) => {
        console.error('Registration error', error);
        return throwError(() => error);
      })
    );
  }

  registerNurse(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiURL + '/NurseRegister', formData).pipe(
      catchError((error) => {
        console.error('Nurse registration error', error);
        return throwError(() => error);
      })
    );
  }

  getUserInfo(): Observable<User> {
    return this.http.get<User>(this.apiURL + '/my-account').pipe(
      tap((user) => {
        this.userSubject.next(user);
        this.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      }),
      catchError((error) => {
        console.error('Get user info error', error);
        // If 401 Unauthorized, logout the user
        if (error.status === 401) {
          this.logout();
        }
        return throwError(() => error);
      })
    );
  }

  sendUserLoginData(values: UserLogin): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiURL + '/login', values).pipe(
      map((response) => {
        if (response.isAuthenticated) {
          return response;
        }
        throw new Error('Invalid response format');
      }),
      catchError((error) => {
        console.error('Login error', error);
        return throwError(() => error);
      })
    );
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http
      .get<User>(`${this.apiURL}/user/profile?email=${email}`)
      .pipe(
        tap((user) => {
          this.userSubject.next(user);
          this.currentUser.set(user);
        }),
        catchError((error) => {
          console.error('Get user by email error', error);
          if (error.staus === 401) {
            this.logout();
          }
          return throwError(() => error);
        })
      );
  }

  getVisits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiURL}`);
  }

  logout(): Observable<any> {
    // Call the backend to invalidate the refresh token
    return this.http.post(this.apiURL + 'logout', {}).pipe(
      tap(() => {
        // Remove user from local storage and clear current user value
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        this.userSubject.next(null);
        this.currentUser.set(null);
        this.router.navigate(['/login']);
      }),
      catchError((error) => {
        // Even if the server call fails, clear local data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        this.userSubject.next(null);
        this.currentUser.set(null);
        this.router.navigate(['/login']);
        return of(null);
      })
    );
  }
}
