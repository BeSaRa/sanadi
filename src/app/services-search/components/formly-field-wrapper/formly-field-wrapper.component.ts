import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { LangService } from '@app/services/lang.service';
import {FieldWrapper} from '@ngx-formly/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'formly-field-wrapper',
  templateUrl: './formly-field-wrapper.component.html',
  styleUrls: ['./formly-field-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class FormlyFieldWrapperComponent extends FieldWrapper implements OnInit, OnDestroy {
  labelKey!: keyof ILanguageKeys;
  private destroy$: Subject<any> = new Subject<any>();

  constructor(public lang: LangService, private cd: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.labelKey = (this.to.label as unknown as keyof ILanguageKeys);
    this.lang.onLanguageChange$.pipe(takeUntil(this.destroy$)).subscribe(() => this.cd.markForCheck());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
