import {Injectable, OnDestroy} from '@angular/core';
import {UrlService} from '@services/url.service';
import {Subject} from 'rxjs';
import {share} from 'rxjs/operators';
import {EmployeeService} from '@services/employee.service';
import {NotificationResponse} from '@models/notification-response';
import {CastResponse} from '@decorators/cast-response';

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  notificationsSource?: EventSource;
  private notificationStream: Subject<any> = new Subject();
  private notifications$ = this.notificationStream.asObservable().pipe(share());

  constructor(private urlService: UrlService,
              private employeeService: EmployeeService) {
  }

  @CastResponse(() => NotificationResponse)
  getNotifications() {
    if (!this.notificationsSource) {
      this.initNotifications();
    }
    return this.notifications$;
  }

  initNotifications() {
    this.notificationsSource = new EventSource(this.urlService.URLS.NOTIFICATIONS + '/' + this.employeeService.getCurrentUser().generalUserId);
    this.setEventListeners();
  }

  private setEventListeners() {
    this.notificationsSource!.addEventListener('open', (result) => {
      console.log('notifications connection opened', result);
    }, false);
    this.notificationsSource!.addEventListener('message', (result) => {
      console.log('notifications', JSON.parse(result.data));
      return this.notificationStream.next(JSON.parse(result.data));
    }, false);
    this.notificationsSource!.addEventListener('error', (result) => {
      console.log('notifications connection closed/failed', result);
    }, false);
  }

  ngOnDestroy(): void {
    this.stopNotifications();
  }

  stopNotifications() {
    this.notificationsSource && this.notificationsSource.close();
    this.notificationsSource = undefined;
  }
}
