import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {UrlService} from '@app/services/url.service';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {EmployeeService} from '@app/services/employee.service';
import {Subject} from 'rxjs';
import {UserPreferencesService} from '@services/user-preferences.service';
import {NotificationService} from '@services/notification.service';

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

  constructor(public langService: LangService,
              public employee: EmployeeService,
              public urlService: UrlService,
              private userPreferencesService: UserPreferencesService,
              private _notificationService: NotificationService) {

  }

  ngOnInit(): void {
    this._notificationService.getNotifications();
  }

  toggleLang($event: MouseEvent) {
    $event.preventDefault();
    this.langService.toggleLanguage().subscribe();
  }

  openUserPreferences() {
    this.userPreferencesService.openEditDialog(this.employee.getCurrentUser().generalUserId).subscribe();
  }

  ngOnDestroy(): void {
    this._notificationService.stopNotifications();
  }
}
