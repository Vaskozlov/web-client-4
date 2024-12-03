import {Routes} from '@angular/router';
import {LoginPageComponent} from './login-page/login-page.component';
import {MainPageComponent} from './main-page/main-page.component';
import {AuthGuard} from './guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPageComponent,
  },
  {
    path: 'main',
    component: MainPageComponent,
    canActivate: [AuthGuard],
  }
];
