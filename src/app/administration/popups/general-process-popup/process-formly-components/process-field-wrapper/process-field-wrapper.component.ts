import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CustomFormlyFieldConfig } from '@app/interfaces/custom-formly-field-config';
import { LangService } from '@app/services/lang.service';
import { ProcessFieldBuilder } from '@app/administration/popups/general-process-popup//process-formly-components/process-fields-builder';

@Component({
  selector: 'process-field-wrapper',
  templateUrl: './process-field-wrapper.component.html',
  styleUrls: ['./process-field-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ProcessFieldWrapperComponent extends FieldWrapper<CustomFormlyFieldConfig> implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject();

  constructor(
    public lang: LangService,
    private cd: ChangeDetectorRef,
  ) {
    super();
  }
  get isInitMode() {
    return this.field.mode == 'init'
  }
  ngOnInit(): void {
    this.lang.onLanguageChange$.pipe(takeUntil(this.destroy$)).subscribe(() => this.cd.markForCheck());
  }
  details(field: CustomFormlyFieldConfig) {
    ProcessFieldBuilder.setlectField(field.id!);
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
