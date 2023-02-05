import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {UrlService} from '@app/services/url.service';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {EmployeeService} from '@app/services/employee.service';
import {Subject} from 'rxjs';
import {UserPreferencesService} from '@services/user-preferences.service';
import {NotificationService} from '@services/notification.service';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {NotificationResponse} from '@models/notification-response';
import {result} from 'lodash';
import {tap} from 'rxjs/operators';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input()
  sidebar!: SidebarComponent;
  destroy$: Subject<any> = new Subject<any>();
  actionIconsEnum = ActionIconsEnum;
  @ViewChild('notificationsTrigger') notificationsTrigger!: ElementRef;

  constructor(public langService: LangService,
              public employee: EmployeeService,
              public urlService: UrlService,
              private userPreferencesService: UserPreferencesService,
              public notificationService: NotificationService) {

  }

  ngOnInit(): void {
    this.notificationService.getNotifications();
  }

  toggleLang($event: MouseEvent) {
    $event.preventDefault();
    this.langService.toggleLanguage().subscribe();
  }

  openUserPreferences() {
    this.userPreferencesService.openEditDialog(this.employee.getCurrentUser().generalUserId).subscribe();
  }

  toggleNotifications($event: Event){
    $event?.stopPropagation();
    $event?.preventDefault();

    this.notificationService.saveUnreadNotificationsAsReadSilently();
    this.notificationsTrigger?.nativeElement.click();
  }


  ngOnDestroy(): void {
    this.notificationService.stopNotifications();
  }
}
