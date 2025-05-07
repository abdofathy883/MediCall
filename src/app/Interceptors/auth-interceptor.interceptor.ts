import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserManagementService } from '../Services/user-management.service';
import { Router } from '@angular/router';
@Injectable()


export class AuthInterceptorInterceptor implements HttpInterceptor {
  constructor(private accountService: UserManagementService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.accountService.getAuthorizationToken();

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Auto logout if 401 response returned from API
          this.accountService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
};
