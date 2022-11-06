import { GeneralProcessService } from './../../../../../services/general-process.service';
import { CustomGeneralProcessFieldConfig } from './../../../../../interfaces/custom-general-process-field';
import { LangService } from './../../../../../services/lang.service';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'process-field-wrapper',
  templateUrl: './process-field-wrapper.component.html',
  styleUrls: ['./process-field-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ProcessFieldWrapperComponent extends FieldWrapper<CustomGeneralProcessFieldConfig> implements OnInit, OnDestroy {
  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    public lang: LangService,
    private cd: ChangeDetectorRef,
    private generalProcessService: GeneralProcessService
    ) {
    super();
  }

  ngOnInit(): void {
    this.lang.onLanguageChange$.pipe(takeUntil(this.destroy$)).subscribe(() => this.cd.markForCheck());
  }
  details(field: CustomGeneralProcessFieldConfig) {
    this.generalProcessService.setlectField(field.id!);
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
