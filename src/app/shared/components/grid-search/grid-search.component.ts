import {Component, EventEmitter, HostBinding, Input, OnInit, Output} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {FormManager} from '../../../models/form-manager';
import {CustomValidators} from '../../../validators/custom-validators';

@Component({
  selector: 'app-grid-search',
  templateUrl: './grid-search.component.html',
  styleUrls: ['./grid-search.component.scss']
})
export class GridSearchComponent implements OnInit {
  @HostBinding('class') containerClass = 'col-8';
  @Output() searchTextEvent = new EventEmitter<string>();

  searchText = new FormControl('');

  constructor(public langService: LangService,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
  }

  search($event: KeyboardEvent): void {
    this.searchTextEvent.emit(this.searchText.value);
  }

  clearSearch($event: MouseEvent): void {
    this.searchText.setValue('');
    this.searchTextEvent.emit(this.searchText.value);
  }

}
