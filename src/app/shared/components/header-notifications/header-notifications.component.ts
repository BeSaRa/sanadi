import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {LangService} from '@services/lang.service';
import {UrlService} from '@services/url.service';
import {NotificationService} from '@services/notification.service';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';

@Component({
  selector: 'header-notifications',
  templateUrl: './header-notifications.component.html',
  styleUrls: ['./header-notifications.component.scss']
})
export class HeaderNotificationsComponent implements OnInit, OnDestroy {
  actionIconsEnum = ActionIconsEnum;
  @ViewChild('notificationsTrigger') notificationsTrigger!: ElementRef;
  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;

  constructor(public langService: LangService,
              public urlService: UrlService,
              public notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.notificationService.getNotifications();
  }

  toggleNotifications($event: Event) {
    $event?.stopPropagation();
    $event?.preventDefault();
    if (!this.dropdownMenu.nativeElement.classList.contains('show')) {
      this.notificationService.saveUnreadNotificationsAsReadSilently();
      setTimeout(() => this.dropdownMenu.nativeElement.scrollTo({top: 0}));
    }
    this.notificationsTrigger?.nativeElement.click();
  }

  ngOnDestroy(): void {
    this.notificationService.stopNotifications();
  }
}
