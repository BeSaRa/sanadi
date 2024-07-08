import {Component, OnDestroy, OnInit} from '@angular/core';
import {FieldType} from '@ngx-formly/core';
import {LangService} from '@services/lang.service';
import {UntypedFormControl} from '@angular/forms';
import {CustomFormlyFieldConfig} from '@contracts/custom-formly-field-config';
import {Observable, Subject} from 'rxjs';

@Component({
  selector: 'formly-select-field',
  templateUrl: './formly-select-field.component.html',
  styleUrls: ['./formly-select-field.component.scss']
})
export class FormlySelectFieldComponent extends FieldType<CustomFormlyFieldConfig> implements OnInit, OnDestroy {
  bindValue!: string;
  private destroy$: Subject<void> = new Subject();

  get bindLabel(): string {
    return this.field.selectOptions?.bindLabel === 'basedOnLanguage' ? (this.lang.map.lang + 'Name') : this.field.selectOptions?.bindLabel!;
  };

  get control(): UntypedFormControl {
    return this.formControl as UntypedFormControl;
  };
  get readonly() {
    return !!this.field.templateOptions?.readonly;
  }
  constructor(public lang: LangService) {
    super();
  }

  ngOnInit(): void {
    this.bindValue = this.field.selectOptions?.bindValue!;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get selectOptions(): Observable<any[]> {
    return this.field.templateOptions?.options as Observable<any[]>;
  }
}
