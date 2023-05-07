import {Component, HostListener} from '@angular/core';
import {LangService} from '@services/lang.service';
import {LoadingService} from '@services/loading.service';
import {CacheService} from '@services/cache.service';
import {NavigationService} from '@services/navigation.service';
import {switchMap, take} from "rxjs/operators";
import {EmployeeService} from "@app/services/employee.service";
import {LocalizationService} from '@services/localization.service';
import {DialogRef} from '@app/shared/models/dialog-ref';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private langService: LangService,
              private localizationService: LocalizationService,
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
    if (!this.employeeService.loggedIn()) {
      return;
    }
    const result = this.localizationService.addDialog();
    let load;
    if (result instanceof DialogRef) {
      load = result.onAfterClose$;
    } else {
      load = result.pipe(switchMap(ref => ref.onAfterClose$));
    }

    load.pipe(take(1))
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
