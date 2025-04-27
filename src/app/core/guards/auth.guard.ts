import { Injectable, inject } from '@angular/core';
import {
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { AccountService } from '../../shared/servics/account.service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  if (accountService.isLoggedIn()) {
    // Check if the route requires specific role
    const requiredRole = route.data['role'] as string;
    
    if (requiredRole) {
      // Check if user has the required role
      const isNurse = accountService.isNurse();
      const isPatient = accountService.isPatient();

      if ((requiredRole === 'Nurse' && isNurse) || 
          (requiredRole === 'Patient' && isPatient) || 
          !requiredRole) {
        return true;
      } else {
        // User doesn't have required role, redirect to unauthorized or home
        return router.createUrlTree(['/unauthorized']);
      }
    }
    
    // No specific role required, allow access
    return true;
  }
  
  // Not logged in - redirect to login page with return url
  return router.createUrlTree(['/account/login'], { queryParams: { returnUrl: state.url } });
}; 