import {Plot} from '../plot';
import {createUrlWithParameters} from '../../query';
import {Injectable} from '@angular/core';

interface PointCheckResult {
  x: number;
  y: number;
  r: number;
  inArea: string;
  executionTimeNs: number;
}

@Injectable({
  providedIn: 'root',
})
export class MainPageLogic
{
  value = 0.0;
  selectedXOptions: string[] = [];
  selectedROptions: string[] = [];
  availableXValues = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  availableRValues = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  plot: Plot | undefined;
  login = '';
  password = '';

  points: PointCheckResult[] = [];

  constructor() {
    const loginFromLocalStorage = localStorage.getItem('login')!!;
    const passwordFromLocalStorage = localStorage.getItem('password')!!;

    this.login = loginFromLocalStorage;
    this.password = passwordFromLocalStorage;
  }

  async ngAfterViewInit() {
    this.plot = new Plot('box1');

    const url = createUrlWithParameters('http://localhost:8080/web-lab-4/validations_results', {
      login: this.login,
      password: this.password
    });

    const response = await fetch(url, {method: 'GET', mode: 'cors'});
    const result = await response.json();

    for (const key in result) {
      if (result.hasOwnProperty(key)) {
        this.processPoint(result[key]);
      }
    }

    this.plot.setOnClickFunction((x, y) => {
      if (this.selectedROptions.length === 0) {
        this.checkPoint(x, y, 1);
        return;
      }


      for (let r of this.selectedROptions) {
        this.checkPoint(x * +r, y * +r, +r);
      }
    });
  }

  checkPoint(x: number, y: number, r: number) {
    const url = createUrlWithParameters('http://localhost:8080/web-lab-4/check', {
      login: this.login,
      password: this.password,
      x: x,
      y: y,
      r: r
    });

    fetch(url, {method: 'GET', mode: 'cors'})
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
  }) {
    this.points.push({
      x: x,
      y: y,
      r: r,
      inArea: inArea ? 'Да' : 'Нет',
      executionTimeNs: executionTimeNs
    });
    this.plot!!.drawPoint(x, y, r, inArea ? 'darkgreen' : 'darkred');
  }

  checkButtonClick() {
    const maxR = Math.max(...this.selectedROptions.map(x => +x));

    for (let x of this.selectedXOptions) {
      for (let r of this.selectedROptions) {
        console.log(+x, this.value, r);
        this.checkPoint(+x, this.value, +r);
      }
    }

    this.plot?.redrawPoints(Math.max(1, maxR));
  }

  async clearButtonClick() {
    const url = createUrlWithParameters('http://localhost:8080/web-lab-4/validations_results', {
      login: this.login,
      password: this.password
    });

    const response = await fetch(url, {method: 'DELETE', mode: 'cors'});

    if (!response.ok) {
      return;
    }

    this.points = [];
    this.plot?.removeAllPoints();
  }

  rChanged() {
    const maxR = Math.max(...this.selectedROptions.map(x => +x));
    this.plot?.redrawPoints(Math.max(1, maxR));
  }

  onLogout() {
    localStorage.removeItem('login');
    localStorage.removeItem('password');
    window.location.href = '/login';
  }
}
