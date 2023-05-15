import { LangService } from './../../../services/lang.service';
import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { IHasVacation } from '@app/interfaces/i-has-vacation';

@Component({
    selector: 'vacation-table',
    templateUrl: 'vacation-table.component.html',
    styleUrls: ['vacation-table.component.scss']
})
export class VacationTableComponent {
  displayedColumns = ['vacationFrom','vacationTo'];
  // ngOnInit(): void {
  //   this.list.push(this.model);
  // }

  @Input()
  set model(value:IHasVacation){
    this.list = [value];
  };
  list:IHasVacation[] = [];
  constructor(public lang:LangService) {

  }

}
