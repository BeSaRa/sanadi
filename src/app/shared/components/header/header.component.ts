import { Component, Input, OnInit } from '@angular/core';
import { LangService } from '@app/services/lang.service';
import { UrlService } from '@app/services/url.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { EmployeeService } from '@app/services/employee.service';
import { Subject } from 'rxjs';
import {UserPreferencesService} from '@services/user-preferences.service';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input()
  sidebar!: SidebarComponent;
  destroy$: Subject<any> = new Subject<any>();

  constructor(public langService: LangService,
              public employee: EmployeeService,
              public urlService: UrlService,
              private userPreferencesService: UserPreferencesService) {
  }

  ngOnInit(): void {
  }

  toggleLang($event: MouseEvent) {
    $event.preventDefault();
    this.langService.toggleLanguage().subscribe();
  }

  openUserPreferences() {
    this.userPreferencesService.openEditDialog(this.employee.getCurrentUser().generalUserId).subscribe();
  }
}
