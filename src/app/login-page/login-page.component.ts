import {Component} from '@angular/core';
import { OnInit } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {MessageModule} from 'primeng/message';
import {CommonModule} from '@angular/common';
import {createUrlWithParameters} from '../lib/query';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, InputTextModule, ButtonModule, MessageModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent implements OnInit{
  public static tokenExpired = false;

  loginForm: FormGroup;
  msg = '';
  loginMinLength = 4;
  passwordMinLength = 8;

  private tryToSaveAccessTokenToLocalStorage(token: string) {
    try {
      localStorage.setItem('access-token', token);
    } catch (e) {
      console.error('Failed to save access token to local storage');
    }
  }

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      login: ['', [
        Validators.required,
        Validators.minLength(this.loginMinLength),
        Validators.pattern('^[a-zA-Z0-9]+$')
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(this.passwordMinLength),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
      ]]
    });
  }

  ngOnInit() {
    if (LoginPageComponent.tokenExpired) {
      console.log('Token expired');
      this.msg = 'Время сессии истекло';
      LoginPageComponent.tokenExpired = false;
    }
  }

  async onLogin() {
    const url = createUrlWithParameters('http://localhost:8080/web-lab-4/api/auth/login', {
      login: this.loginForm.controls['login'].value,
      password: this.loginForm.controls['password'].value,
    });

    const response = await fetch(url, {method: 'GET', mode: 'cors'});

    if (!response.ok) {
      this.msg = 'Неправильный логин или пароль';
      return;
    }

    this.tryToSaveAccessTokenToLocalStorage(response.headers.get('Authorization')!!);
    await this.router.navigate(['/main']);
  }

  async onRegister() {
    const url = createUrlWithParameters('http://localhost:8080/web-lab-4/api/auth/register', {
      login: this.loginForm.controls['login'].value,
      password: this.loginForm.controls['password'].value,
    });

    const response = await fetch(url, {method: 'GET', mode: 'cors'});

    if (!response.ok) {
      this.msg = 'Пользователь с данным логином уже существует';
      return;
    }

    this.tryToSaveAccessTokenToLocalStorage(response.headers.get('Authorization')!!);
    await this.router.navigate(['/main']);
  }

  isPasswordTouched() {
    return !this.loginForm.controls['password'].untouched;
  }

  isPasswordLongEnough() {
    return !this.loginForm.controls['password'].errors?.['minlength'];
  }

  isPasswordStrongEnough() {
    return !this.loginForm.controls['password'].errors?.['pattern'];
  }

  isLoginTouched() {
    return !this.loginForm.controls['login'].untouched;
  }

  isLoginValid() {
    return !this.loginForm.controls['login'].errors?.['pattern'];
  }

  isLoginLongEnough() {
    return (this.loginForm.controls['login'].value as string).length >= 4;
  }
}
