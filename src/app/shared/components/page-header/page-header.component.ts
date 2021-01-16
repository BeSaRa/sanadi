import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ILanguageKeys} from '../../../interfaces/i-language-keys';
import {LangService} from '../../../services/lang.service';
import {BehaviorSubject, Subject} from 'rxjs';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent implements OnInit, OnDestroy {
  @Input() pageTitle: keyof ILanguageKeys = {} as keyof ILanguageKeys;
  @Input() clickOnReload$: BehaviorSubject<any> = {} as BehaviorSubject<any>;
  @Input() clickOnNew$: Subject<any> = {} as Subject<any>;

  constructor(public langService: LangService) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.clickOnReload$.complete();
    this.clickOnNew$.complete();
  }

}
