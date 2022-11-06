import { GeneralProcessTemplateFieldTypes } from './../../../../../enums/general-process-template-field-types.enum';
import { IKeyValue } from '@contracts/i-key-value';
import { CustomGeneralProcessFieldConfig } from './../../../../../interfaces/custom-general-process-field';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { LangService } from '@services/lang.service';
import { UntypedFormControl } from '@angular/forms';
import { Subject, of, Observable } from 'rxjs';

@Component({
  selector: 'process-select-field',
  templateUrl: './process-select-field.component.html',
  styleUrls: ['./process-select-field.component.scss']
})
export class ProcessSelectFieldComponent extends FieldType<CustomGeneralProcessFieldConfig> implements OnInit, OnDestroy {
  bindValue!: string;
  bindLabel!: string;

  private destroy$: Subject<any> = new Subject<any>();

  get control(): UntypedFormControl {
    return this.formControl as UntypedFormControl;
  };
  get isYesOrNo() {
    return this.field.type == GeneralProcessTemplateFieldTypes[GeneralProcessTemplateFieldTypes.yesOrNo]
  }
  constructor(public lang: LangService) {
    super();
  }

  ngOnInit(): void {
    this.bindValue = this.field.selectOptions?.bindValue!;
    this.bindLabel = this.field.selectOptions?.bindLabel!;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get selectOptions(): Observable<any[]> {
    if (this.isYesOrNo) {
      return of([
        { id: 0, name: 'No' },
        { id: 1, name: 'Yes' }
      ])
    }
    return of(this.field.selectOptions?.options!);
  }
}
