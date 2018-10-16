import { Injectable } from '@angular/core';
import {CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import { AuthService} from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private url: string;

  constructor(private authService: AuthService, private router: Router) {}

  private handleAuthState(): boolean {
    if (this.isLoginOrRegisted()) {
      this.router.navigate(['/rentals']);
      return false;
    }

    return true;
  }

  private handleNotAuthState(): boolean {
    if (this.isLoginOrRegisted()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }

  private isLoginOrRegisted(): boolean {
    if (this.url.includes('login') || this.url.includes('register')) {
      return true;
    }

    return false;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.url = state.url;

    if (this.authService.isAuthenticated()) {
      return this.handleAuthState();
    }

    return this.handleNotAuthState();
  }
}
