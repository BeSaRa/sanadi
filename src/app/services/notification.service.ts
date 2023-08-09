import {ChangeDetectorRef, Injectable, OnDestroy} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {catchError, map, share, takeUntil} from 'rxjs/operators';
import {EmployeeService} from '@services/employee.service';
import {NotificationResponse} from '@models/notification-response';
import {CastResponse} from '@decorators/cast-response';
import {ConfigurationService} from '@services/configuration.service';
import {HttpClient, HttpContext} from '@angular/common/http';
import {NotificationResponseInterceptor} from '@model-interceptors/notification-response-interceptor';
import {SharedService} from '@services/shared.service';
import {NO_LOADER_TOKEN} from '@app/http-context/tokens';
import {FactoryService} from '@services/factory.service';
import {InboxService} from '@services/inbox.service';
import {Router} from '@angular/router';
import {DialogService} from '@services/dialog.service';
import {LangService} from '@services/lang.service';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {CommonUtils} from '@helpers/common-utils';

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
  private cd?:ChangeDetectorRef

  constructor(private configService: ConfigurationService,
              private http: HttpClient,
              private router: Router,
              private sharedService: SharedService,
              private dialog: DialogService,
              private inboxService: InboxService, // used in NotificationResponse model
              private employeeService: EmployeeService) {
    FactoryService.registerService('NotificationService', this);
  }

  private loadAllNotifications(): void {
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
      this.loadAllNotifications();
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
    if (!unreadNotifications.length) {
      return;
    }

    this.http.put(this._getServiceURL() + '/set-read', unreadNotifications.map(item => item.id), {
      context: new HttpContext().set(NO_LOADER_TOKEN, true)
    })
      .pipe(
        map((response: any) => {
          return response;
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

  openInfoNotification(notification: NotificationResponse): void {
    const lang: LangService = FactoryService.getService('LangService');
    let infoMsg: keyof ILanguageKeys = {} as keyof ILanguageKeys;
    if (notification.isTerminatedNotification()){
      infoMsg = 'msg_terminated_notification';
    }
    !CommonUtils.isEmptyObject(infoMsg) && (this.dialog.info(lang.map[infoMsg]));
  }

  openNotification(notification: NotificationResponse): void {
    this.router.navigate([notification.itemRoute], { queryParams: { item: notification.itemDetails } }).then();
  }

  private initNotifications() {
    this.notificationsSource = new EventSource(this._getServiceURL() + '/' + this.employeeService.getCurrentUser().generalUserId);
    this.setEventListeners();
  }

  private updateUnreadCount() {
    this.unreadCount = this.getUnreadNotifications().length;
    this.cd?.detectChanges();
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
    this.notificationsList = [];
    this.unreadCount = 0;
  }
  setChangeDetection(cd:ChangeDetectorRef){
    this.cd =  cd
  }
}
