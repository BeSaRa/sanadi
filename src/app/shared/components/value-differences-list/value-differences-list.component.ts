import {Component, Input} from '@angular/core';
import {LangService} from '@services/lang.service';
import {IValueDifference} from '@contracts/i-value-difference';

@Component({
  selector: 'value-differences-list',
  templateUrl: './value-differences-list.component.html',
  styleUrls: ['./value-differences-list.component.scss']
})
export class ValueDifferencesListComponent {
  constructor(public lang: LangService) {
  }

  @Input() differenceList: IValueDifference[] = [];
  @Input() hasSubRecords: boolean = false;
  displayedColumns: string[] = ['fieldName', 'oldValue', 'newValue'];

}
