import {Component} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {MessageModule} from 'primeng/message';
import {CommonModule} from '@angular/common';
import {createUrlWithParameters} from '../../query';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, InputTextModule, ButtonModule, MessageModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  loginForm: FormGroup;

  msg = '';
  loginMinLength = 4;
  passwordMinLength = 8;

  private tryToLoadLoginAndPasswordFromLocalStorage() {
    const loginFromLocalStorage = localStorage.getItem('login');

    if (loginFromLocalStorage) {
      this.loginForm.controls['login'].setValue(loginFromLocalStorage);
    }

    const passwordFromLocalStorage = localStorage.getItem('password');

    if (passwordFromLocalStorage) {
      this.loginForm.controls['password'].setValue(passwordFromLocalStorage);
    }
  }

  private tryToSaveLoginAndPasswordToLocalStorage() {
    try {
      localStorage.setItem('login', this.loginForm.controls['login'].value);
      localStorage.setItem('password', this.loginForm.controls['password'].value);
    } catch (e) {

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

    this.tryToLoadLoginAndPasswordFromLocalStorage();
  }

  async onLogin() {
    const url = createUrlWithParameters('http://localhost:8080/web-lab-4/auth', {
      login: this.loginForm.controls['login'].value,
      password: this.loginForm.controls['password'].value,
    });

    const response = await fetch(url, {method: 'GET', mode: 'cors'});

    if (!response.ok) {
      this.msg = 'Invalid login or password';
      return;
    }

    this.tryToSaveLoginAndPasswordToLocalStorage();
    await this.router.navigate(['/main']);
  }

  async onRegister() {
    const url = createUrlWithParameters('http://localhost:8080/web-lab-4/register', {
      login: this.loginForm.controls['login'].value,
      password: this.loginForm.controls['password'].value,
    });

    const response = await fetch(url, {method: 'GET', mode: 'cors'});

    if (!response.ok) {
      this.msg = 'User with the same login already exists';
      return;
    }

    this.tryToSaveLoginAndPasswordToLocalStorage();

    this.msg = 'Registration succeed';
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
