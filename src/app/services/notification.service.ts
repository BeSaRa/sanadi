import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {catchError, map, share, takeUntil, tap} from 'rxjs/operators';
import {EmployeeService} from '@services/employee.service';
import {NotificationResponse} from '@models/notification-response';
import {CastResponse} from '@decorators/cast-response';
import {ConfigurationService} from '@services/configuration.service';
import {HttpClient} from '@angular/common/http';
import {NotificationResponseInterceptor} from '@model-interceptors/notification-response-interceptor';
import {SharedService} from '@services/shared.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  notificationsList: NotificationResponse[] = [];
  unreadCount: number = 0;
  maxUnreadToShow: number = 10;
  private notificationsSource?: EventSource;
  private destroy$: Subject<any> = new Subject();
  private notificationStream: Subject<any> = new Subject();
  private notifications$ = this.notificationStream.asObservable().pipe(share());

  constructor(private configService: ConfigurationService,
              private http: HttpClient,
              private sharedService: SharedService,
              private employeeService: EmployeeService) {
    this._loadAllNotifications().subscribe((result) => {
      this.notificationsList = result;
      this.updateUnreadCount();
    });
  }

  private _getServiceURL(): string {
    return this.configService.CONFIG.NOTIFICATIONS_URL;
  }

  @CastResponse(() => NotificationResponse)
  private _loadAllNotifications(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(this._getServiceURL() + '/' + this.employeeService.getCurrentUser().generalUserId + '/all')
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of([]))
      );
  }

  @CastResponse(() => NotificationResponse)
  getNotifications() {
    if (!this.notificationsSource) {
      this.initNotifications();
    }
    return this.notifications$;
  }

  getUnreadNotifications(): NotificationResponse[] {
    return this.notificationsList.filter(item => !item.read) ?? [];
  }

  saveUnreadNotificationsAsReadSilently(): void {
    let unreadNotifications = this.getUnreadNotifications();
    unreadNotifications.forEach(notification => notification.read = true);
    this.unreadCount = 0;

    this.http.put(this._getServiceURL() + '/set-read', {
      ids: unreadNotifications.map(item => item.id)
    })
      .pipe(
        map((response: any) => {
          return response.rs;
        })
      )
      .subscribe((response) => {
        this.sharedService.mapBulkResponseMessages(unreadNotifications, 'id', response, 'UPDATE', true)
          .subscribe((result) => {
            result.fails.forEach(failedNotification => failedNotification.read = false);
            this.updateUnreadCount();
          });
      });
  }

  private initNotifications() {
    this.notificationsSource = new EventSource(this._getServiceURL() + '/' + this.employeeService.getCurrentUser().generalUserId);
    this.setEventListeners();
  }

  private updateUnreadCount() {
    this.unreadCount = this.getUnreadNotifications().length;
  }

  private setEventListeners() {
    if (!this.notificationsSource) {
      return;
    }
    let notificationResponseInterceptor = new NotificationResponseInterceptor();
    this.notificationsSource.addEventListener('open', (result) => {
      console.log('notifications connection opened', result);
    }, false);
    this.notificationsSource.addEventListener('message', (result) => {
      let finalData = notificationResponseInterceptor.receive(new NotificationResponse().clone(JSON.parse(result.data)));
      console.log('notifications', finalData);
      this.notificationsList.push(finalData);
      this.updateUnreadCount();
      return this.notificationStream.next(finalData);
    }, false);
    this.notificationsSource.addEventListener('error', (result) => {
      console.log('notifications connection closed/failed', result);
    }, false);
  }

  ngOnDestroy(): void {
    this.stopNotifications();
    this.destroy$.next();
    this.destroy$.complete();
  }

  stopNotifications() {
    this.notificationsSource && this.notificationsSource.close();
    this.notificationsSource = undefined;
  }
}
