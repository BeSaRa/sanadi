import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ISearchColumnConfig } from '@app/interfaces/i-search-column-config';
import { LangService } from '@app/services/lang.service';

@Component({
  selector: 'app-header-search-field',
  templateUrl: './header-search-field.component.html',
  styleUrls: ['./header-search-field.component.css']
})
export class HeaderSearchFieldComponent implements OnInit {
  @Input() form!: UntypedFormGroup;
  options: any[] = [];
  @Input() field!: ISearchColumnConfig;
  @Output() change: EventEmitter<null> = new EventEmitter();
  optionValueKey: string = 'id';
  get control(): UntypedFormControl {
    return this.form.get(this.field.property) as UntypedFormControl;
  }

  constructor(public lang: LangService) { }
  ngOnInit() {
    console.log(this.form)
    this.options = this.field.selectOptions?.options || [];
    this.optionValueKey = this.field.selectOptions?.optionValueKey || 'id';
  }

  isTextControl() {
    return this.field.controlType == 'text'
  }
  isSelectControl() {
    return this.field.controlType == 'select'
  }
  isMultiple() {
    return !!(this.field.selectOptions && this.field.selectOptions.multiple)
  }
  isFunction(option: any) {
    return this.field.selectOptions && typeof option[this.field.selectOptions.lableProperty] === 'function'
  }
  _change() {
    this.change.emit(null);
  }
}
