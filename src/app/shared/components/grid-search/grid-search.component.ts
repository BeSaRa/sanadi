import {Component, EventEmitter, HostBinding, Input, OnInit, Output} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {FormControl} from '@angular/forms';
import {isEmptyObject, objectHasValue} from '../../../helpers/utils';
import {FilterEventTypes} from '../../../types/types';
import {DialogService} from '../../../services/dialog.service';
import {UserClickOn} from '../../../enums/user-click-on.enum';

@Component({
  selector: 'app-grid-search',
  templateUrl: './grid-search.component.html',
  styleUrls: ['./grid-search.component.scss']
})
export class GridSearchComponent implements OnInit {
  @HostBinding('class') containerClass = 'col-8';
  @Output() searchTextEvent = new EventEmitter<string>();
  @Output('filterEvent') filterButtonEvent = new EventEmitter<FilterEventTypes>();

  @Input() filterButton: boolean = false;
  @Input() filterCriteria: any = {};

  searchText = new FormControl('');

  constructor(public langService: LangService,
              private dialogService: DialogService) {
  }

  ngOnInit(): void {
  }

  hasFilterCriteria(): boolean {
    return !isEmptyObject(this.filterCriteria) && objectHasValue(this.filterCriteria);
  }

  search($event: KeyboardEvent): void {
    this.searchTextEvent.emit(this.searchText.value);
  }

  clearSearch($event: MouseEvent): void {
    this.searchText.setValue('');
    this.searchTextEvent.emit(this.searchText.value);
  }

  openCriteriaDialog($event: MouseEvent): void {
    $event.preventDefault();
    this.filterButtonEvent.emit('OPEN');
  }

  clearFilter($event: MouseEvent): void {
    $event.preventDefault();
    this.dialogService.confirm(this.langService.map.msg_confirm_clear_filter_criteria, {
      actionBtn: 'btn_reset',
      cancelBtn: 'btn_cancel'
    }).onAfterClose$
      .subscribe((clickOn: UserClickOn) => {
        if (clickOn === UserClickOn.YES) {
          this.filterButtonEvent.emit('CLEAR');
        }
      })
  }

}
