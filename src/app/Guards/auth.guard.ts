import { inject, Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserManagementService } from '../Services/user-management.service';

export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserManagementService);
  const router = inject(Router);

  const token = localStorage.getItem('token');
  if (!token) {
    // Redirect to login if not logged in
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }
  const requiredRole = route.data['role'] as string;

  if (requiredRole) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = user.role;

    if (
      (requiredRole === 'Nurse' && userRole === 'Nurse') ||
      (requiredRole === 'Patient' && userRole === 'Patient')
    ) {
      return true;
    } else {
      return router.createUrlTree(['/unauthorized']);
    }
  }
  return true;
};
