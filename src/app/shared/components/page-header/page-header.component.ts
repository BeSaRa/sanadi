import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ILanguageKeys} from '../../../interfaces/i-language-keys';
import {LangService} from '../../../services/lang.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {isEmptyObject} from '../../../helpers/utils';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent implements OnInit, OnDestroy {
  @Input() pageTitle: keyof ILanguageKeys = {} as keyof ILanguageKeys;
  @Input() clickOnReload$: BehaviorSubject<any> = {} as BehaviorSubject<any>;
  @Input() clickOnNew$: Subject<any> = {} as Subject<any>;

  isReloadAvailable = false;
  isAddAvailable = false;

  constructor(public langService: LangService) {
  }

  ngOnInit(): void {
    this.isAddAvailable = !isEmptyObject(this.clickOnNew$);
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

}
