import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {MessageModule} from 'primeng/message';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TableModule} from 'primeng/table';
import {CheckboxModule} from 'primeng/checkbox';
import {InputNumber} from 'primeng/inputnumber';
import {Plot} from '../lib/plot';
import {createUrlWithParameters} from '../lib/query';
import {PointCheckResult} from '../lib/point-check-result';
import {Router} from '@angular/router';
import {LoginPageComponent} from '../login-page/login-page.component';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    CheckboxModule,
    InputNumber
  ],
  templateUrl: 'main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent {
  value = 0.0;
  selectedXOptions: string[] = [];
  selectedROptions: string[] = [];
  availableXValues = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  availableRValues = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  plot: Plot | null = null;
  login = '';
  password = '';
  currentR: number = 1.0;
  accessToken = '';
  points: PointCheckResult[] = [];

  constructor(private router: Router) {
    this.accessToken = localStorage.getItem('access-token')!!;
  }

  private async fetchWithToken(url: string, options: RequestInit): Promise<Response> {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': this.accessToken
      }
    }).then(async response => {
      if (!response.ok) {
        const reason = await response.text();
        console.error(`Failed to fetch ${url}: ${reason}`);

        if (reason.startsWith("Token expired")) {
          LoginPageComponent.tokenExpired = true;
          await this.router.navigate(['/login'], {queryParams: {msg: reason}});
        } else {
          await this.router.navigate(['/login']);
        }
      }

      return response;
    });
  }

  async ngAfterViewInit() {
    this.plot = new Plot('box1');

    const response = await this.fetchWithToken(
      'http://localhost:8080/web-lab-4/api/user/get_results',
      {
        method: 'GET',
        mode: 'cors',
      }
    );

    if (!response.ok) {
      console.log('Invalid access token');
      await this.router.navigate(['/login']);
      return;
    }

    const result = await response.json();

    for (const key in result) {
      if (result.hasOwnProperty(key)) {
        this.processPoint(result[key]);
      }
    }

    this.plot.setOnClickFunction((x, y) => {
      this.checkPoint(x * this.currentR, y * this.currentR, this.currentR);
    });
  }

  checkPoint(x: number, y: number, r: number) {
    const url = createUrlWithParameters('http://localhost:8080/web-lab-4/api/user/check', {
      x: x,
      y: y,
      r: r,
    });

    this.fetchWithToken(url, {
      method: 'GET',
      mode: 'cors',
    })
      .then(response => response.json())
      .then(result => {
        this.processPoint(result);
      });
  }

  processPoint({x, y, r, inArea, executionTimeNs}: {
                 x: number,
                 y: number,
                 r: number,
                 inArea: boolean,
                 executionTimeNs: number
               }
  ) {
    this.points.push({
      x: x,
      y: y,
      r: r,
      inArea: inArea ? 'Да' : 'Нет',
      executionTimeNs: executionTimeNs,
    });

    console.log(`First: ${x}, ${y}, ${r}, ${inArea}, ${executionTimeNs}`);
    this.plot!!.drawPoint(x, y, this.currentR, inArea ? 'darkgreen' : 'darkred', r);
  }

  checkButtonClick() {
    const maxR = Math.max(...this.selectedROptions.map(x => +x), 1);

    for (let x of this.selectedXOptions) {
      for (let r of this.selectedROptions) {
        this.checkPoint(+x, this.value, +r);
      }
    }

    this.currentR = maxR;
    this.plot?.redrawPoints(maxR);
  }

  async clearButtonClick() {
    const response = await this.fetchWithToken('http://localhost:8080/web-lab-4/api/user/delete_results',
      {
        method: 'DELETE',
        mode: 'cors',
      });

    if (!response.ok) {
      return;
    }

    this.points = [];
    this.plot?.removeAllPoints();
  }

  rChanged() {
    const maxR = Math.max(...this.selectedROptions.map(x => +x), 1);
    this.currentR = maxR;
    this.plot?.redrawPoints(maxR);
  }

  onLogout() {
    localStorage.removeItem('access-token');
    window.location.href = '/login';
  }
}
