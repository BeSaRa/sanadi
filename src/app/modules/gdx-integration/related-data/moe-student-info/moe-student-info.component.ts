import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { CommonUtils } from '@app/helpers/common-utils';
import { SortEvent } from '@app/interfaces/sort-event';
import { GdxMoeResponse } from '@app/models/gdx-moe-pending-installments';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';

@Component({
  selector: 'moe-student-info',
  templateUrl: './moe-student-info.component.html',
  styleUrls: ['./moe-student-info.component.scss']
})
export class MoeStudentInfoComponent {
  @Input() list: GdxMoeResponse[] = [];

  @Output() onSelectStudentInfo: EventEmitter<GdxMoeResponse> = new EventEmitter<GdxMoeResponse>();

  constructor(public lang: LangService) {
  }
  headerColumn: string[] = ['extra-header'];

  displayedColumns: string[] = ['studentQID', 'gradeLevelEN', 'gradeLevelAR', 'studentNameEN', 'schoolNameAR', 'schoolNameEN', 'actions'];
  filterControl: UntypedFormControl = new UntypedFormControl('');

  actions: IMenuItem<GdxMoeResponse>[] = [
    {
      type: 'action',
      label: 'select',
      show: () => true,
      onClick: (item: GdxMoeResponse) => this.setSelectedStudentInfo(item)
    }
  ];

  selectedMoeStudentInfo?: GdxMoeResponse;

  setSelectedStudentInfo(item?: GdxMoeResponse) {
    this.selectedMoeStudentInfo = item;
    this.onSelectStudentInfo.emit(item);
  }
}
