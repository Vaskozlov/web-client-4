import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {
  }

  canActivate(): boolean {
    const login = localStorage.getItem('login');
    const password = localStorage.getItem('password');

    if (login && password) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
