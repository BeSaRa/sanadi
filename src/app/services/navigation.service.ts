import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {FactoryService} from './factory.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  currentPath: string = '';
  previousPath: string = '';

  constructor(private router: Router) {
    FactoryService.registerService('NavigationService', this);
  }

  listenRouteChange(): void {
    this.currentPath = this.router.url;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousPath = this.currentPath;
        this.currentPath = event.url;
        // console.log('previous path', this.previousPath);
        // console.log('current path', this.currentPath);
      }
    });
  }

  hasBackUrl(): boolean {
    return !!(this.previousPath && this.previousPath !== '/' && this.previousPath !== '/login' && this.previousPath !== '/login-external');
  }

  goToBack(): void {
    this.router.navigateByUrl(this.previousPath).then();
  }
}
