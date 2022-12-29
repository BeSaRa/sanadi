import {Component, Input} from '@angular/core';
import {LangService} from '@services/lang.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {UntypedFormControl} from '@angular/forms';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {GdxMolPayrollResponse} from '@app/models/gdx-mol-payroll-response';
import {GdxMolPayroll} from '@app/models/gdx-mol-payroll';

@Component({
  selector: 'mol-related-data-list',
  templateUrl: './mol-related-data-list.component.html',
  styleUrls: ['./mol-related-data-list.component.scss']
})
export class MolRelatedDataListComponent {
  @Input() list: GdxMolPayroll[] = [];

  constructor(public lang: LangService) {
  }

  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  headerColumn: string[] = ['extra-header'];
  displayedColumns: string[] = ['qId', 'payrollMonth', 'payrollYear', 'visaNumber', 'establishmentNameAra', 'establishmentName', 'basicSalary', 'netSalary'];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  sortingCallbacks = {};
  actions: IMenuItem<GdxMolPayrollResponse>[] = [];
}
