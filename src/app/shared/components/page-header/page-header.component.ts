import {Component, HostBinding, Input, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {LangService} from '@app/services/lang.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {isEmptyObject} from '@app/helpers/utils';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent implements OnInit, OnDestroy {
  @HostBinding('class') containerClass = 'col-md-6 col-sm-12';
  @Input() pageTitle: keyof ILanguageKeys = {} as keyof ILanguageKeys;
  @Input() clickOnReload$: BehaviorSubject<any> = {} as BehaviorSubject<any>;
  @Input() clickOnNew$: Subject<any> = {} as Subject<any>;
  @Input() addPermission = true;
  @Input() customTemplate?: TemplateRef<any>;
  @Input() useReloadValue: boolean = false;

  @Input() disableAdd: boolean = false;
  @Input() disableReload: boolean = false;

  isReloadAvailable = false;

  constructor(public langService: LangService) {
  }

  ngOnInit(): void {
    this.isReloadAvailable = !isEmptyObject(this.clickOnReload$);
  }

  ngOnDestroy(): void {
    if (this.isReloadAvailable) {
      this.clickOnReload$.complete();
    }
    if (this.isAddAvailable) {
      this.clickOnNew$.complete();
    }
  }

  get isAddAvailable(): boolean {
    return this.addPermission && !isEmptyObject(this.clickOnNew$)
  }

  reloadCallback(): void {
    if (this.useReloadValue) {
      !this.disableReload && this.clickOnReload$.next(this.clickOnReload$.value);
    } else {
      !this.disableReload && this.clickOnReload$.next(null);
    }
  }


  clickAdd() {
    !this.disableAdd && this.clickOnNew$.next(null)
  }
}
