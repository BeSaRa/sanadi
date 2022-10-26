import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {FieldWrapper} from '@ngx-formly/core';
import {LangService} from '../../../services/lang.service';
import {ILanguageKeys} from '../../../interfaces/i-language-keys';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'formly-field-hulf-grid-wrapper',
  templateUrl: './formly-field-hulf-grid-wrapper.component.html',
  styleUrls: ['./formly-field-hulf-grid-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class FormlyFieldHulfGridWrapperComponent extends FieldWrapper implements OnInit, OnDestroy {
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
