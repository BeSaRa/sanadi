import {UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  ISearchColumnConfig,
  SearchColumnConfigMap,
  SearchColumnEventType
} from '@app/interfaces/i-search-column-config';
import {LangService} from '@app/services/lang.service';
import {CommonUtils} from '@helpers/common-utils';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {DateUtils} from '@helpers/date-utils';
import {IAngularMyDpOptions, IMyDateModel} from 'angular-mydatepicker';

@Component({
  selector: 'header-search-field',
  templateUrl: './header-search-field.component.html',
  styleUrls: ['./header-search-field.component.scss']
})
export class HeaderSearchFieldComponent implements OnInit {
  constructor(public lang: LangService) {
  }

  @Input() form!: UntypedFormGroup;
  @Input() column!: string;
  private _searchConfig!: SearchColumnConfigMap;
  @Input()
  set searchConfig(value: SearchColumnConfigMap) {
    if (CommonUtils.isEmptyObject(value)) {
      value = {} as SearchColumnConfigMap;
    }
    value['_'] = this._emptyConfig;
    value['search_actions'] = this._searchActionsConfig;
    this._searchConfig = value;
  }

  get searchConfig(): SearchColumnConfigMap {
    return this._searchConfig;
  }

  @Output() filterChange: EventEmitter<SearchColumnEventType> = new EventEmitter();

  options: any[] = [];
  optionValueKey: string = 'id';
  isMultiple: boolean = false;

  private _emptyConfig: ISearchColumnConfig = {
    controlType: 'empty',
    property: '_',
    key: '_',
    label: {} as keyof ILanguageKeys
  };
  private _searchActionsConfig: ISearchColumnConfig = {
    controlType: 'search_actions',
    property: 'search_actions',
    key: 'search_actions',
    label: {} as keyof ILanguageKeys
  };

  ngOnInit(): void {
    this._setSelectControlOptions();
  }

  get control(): UntypedFormControl {
    return this.form.get(this.field.property) as UntypedFormControl;
  }

  get field(): ISearchColumnConfig {
    return this.searchConfig[this.column];
  }

  private _setSelectControlOptions() {
    if (this.isSelectColumn()) {
      this.options = this.field.selectOptions?.options || [];
      this.optionValueKey = this.field.selectOptions?.optionValueKey || 'id';
      this.isMultiple = !!(this.field.selectOptions?.multiple);
    }
  }

  isEmptyColumn() {
    return this.column === '_' || !this.field || this.field.hide;
  }

  isSearchActionsColumn() {
    return !this.isEmptyColumn() && this.column.toLowerCase() === 'search_actions';
  }

  isTextColumn() {
    return !this.isEmptyColumn() && this.field.controlType === 'text';
  }

  isSelectColumn() {
    return !this.isEmptyColumn() && this.field.controlType === 'select';
  }

  private _emitOnChange(emitType: SearchColumnEventType) {
    this.filterChange.emit(emitType);
  }

  handleInputChange() {
    this._emitOnChange('filter');
  }

  clearInputFilter() {
    this.control.reset();
    this._emitOnChange('filter');
  }

  handleSelectChange() {
    this._emitOnChange('filter');
  }

  clearAllColumnFilter() {
    this.form.reset();
    this._emitOnChange('clear');
  }

  columnFilterFormHasValue() {
    return CommonUtils.objectHasValue(this.form.value);
  }
}
