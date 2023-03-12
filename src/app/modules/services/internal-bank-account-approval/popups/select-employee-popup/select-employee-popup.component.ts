import {Component, Inject} from '@angular/core';
import {LangService} from '@services/lang.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {NpoEmployee} from '@models/npo-employee';

@Component({
  selector: 'select-employee-popup',
  templateUrl: './select-employee-popup.component.html',
  styleUrls: ['./select-employee-popup.component.scss']
})
export class SelectEmployeePopupComponent {
  displayedColumns: string[] = ['qId', 'arName', 'enName', 'jobTitleInfo', 'actions'];

  constructor(public lang: LangService, private dialogRef: DialogRef,
              @Inject(DIALOG_DATA_TOKEN) public data: {
                employees: NpoEmployee[]
              }) {
    console.log('emps', data.employees);
  }

  selectEmployee(employee: NpoEmployee): void {
    this.dialogRef.close(employee);
  }
}
