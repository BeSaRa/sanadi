import {Component, HostListener} from '@angular/core';
import {LangService} from '@services/lang.service';
import {LoadingService} from '@services/loading.service';
import {CacheService} from '@services/cache.service';
import {NavigationService} from '@services/navigation.service';
import {take} from "rxjs/operators";
import {EmployeeService} from "@app/services/employee.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private langService: LangService,
              public loadingService: LoadingService,
              private cacheService: CacheService,
              private employeeService: EmployeeService,
              private navigationService: NavigationService) {
    this.navigationService.listenRouteChange();
    this.setHeadTitle()
  }

  setHeadTitle() {
    this.langService.changeTitle()
  }

  @HostListener('window:keydown.control.alt.l')
  languageChangeDetection(): void {
    this.langService
      .toggleLanguage()
      .pipe(take(1))
      .subscribe();
  }

  @HostListener('window:keydown.control.alt.a')
  addLocalization() {
    this.employeeService.loggedIn() && this.langService
      .addDialog().onAfterClose$
      .pipe(take(1))
      .subscribe((result) => {
        if (!!result) {
          this.langService.load(true).subscribe();
        }
      })
  }

  @HostListener('window:keydown.f2')
  refreshCache() {
    this.employeeService.loggedIn() && this.cacheService.refreshCache(this.employeeService.isExternalUser(), true)
  }
}
