import {Component, Input, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {UrlService} from '@app/services/url.service';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {EmployeeService} from '@app/services/employee.service';
import {Subject} from 'rxjs';
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
              public employeeService: EmployeeService,
              public urlService: UrlService,
              private userPreferencesService: UserPreferencesService) {
  }

  ngOnInit(): void {
     this.toggleToDefaultLanguage();
  }

  toggleToDefaultLanguage(): void {
    if (this.employeeService.isToggledToDefaultLanguage) {
      return;
    }
    this.employeeService.isToggledToDefaultLanguage = true;
    const defaultLang = this.employeeService.getCurrentUser().userPreferences.defaultLang;
    if (defaultLang !== this.langService.getCurrentLanguage().id) {
       this.toggleLang();
    }
  }

  toggleLang($event?: MouseEvent) {
    $event?.preventDefault();
    this.langService.toggleLanguage().subscribe();
  }

  openUserPreferences() {
    this.userPreferencesService.openEditDialog(this.employeeService.getCurrentUser()).subscribe();
  }
}
