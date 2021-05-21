import {Component, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {SortEvent} from '../../../interfaces/sort-event';
import {PageEvent} from '../../../interfaces/page-event';

const ELEMENT_DATA = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'app-user-inbox',
  templateUrl: './user-inbox.component.html',
  styleUrls: ['./user-inbox.component.scss']
})
export class UserInboxComponent implements OnInit {
  datasource: any = ELEMENT_DATA;
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  searchModel = '';

  constructor(public lang: LangService) {
  }

  ngOnInit(): void {
  }

  sortBy($event: SortEvent) {
    console.log($event);
  }

  search($event: Event) {
    let input = $event.target as HTMLInputElement;
    this.searchModel = input.value;
  }

  log($event: PageEvent) {
    console.log($event);
  }
}
