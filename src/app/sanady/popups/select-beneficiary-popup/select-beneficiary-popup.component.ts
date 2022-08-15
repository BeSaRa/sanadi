import { Component, Inject } from '@angular/core';
import { LangService } from '@services/lang.service';
import { Beneficiary } from '@app/models/beneficiary';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { UntypedFormControl } from '@angular/forms';
import { SortEvent } from '@app/interfaces/sort-event';
import { CommonUtils } from '@app/helpers/common-utils';

@Component({
  selector: 'app-select-beneficiary-popup',
  templateUrl: './select-beneficiary-popup.component.html',
  styleUrls: ['./select-beneficiary-popup.component.scss']
})
export class SelectBeneficiaryPopupComponent {
  constructor(public langService: LangService,
              @Inject(DIALOG_DATA_TOKEN) public list: Beneficiary[], private dialogRef: DialogRef) {
  }

  userClick: typeof UserClickOn = UserClickOn;
  headerColumn: string[] = ['extra-header'];
  displayedColumns: string[] = ['arName', 'enName', 'gender', 'nationality', 'identification',  'sponsors', 'actions'];
  filterControl: UntypedFormControl = new UntypedFormControl('');

  sortingCallbacks = {
    gender: (a: Beneficiary, b: Beneficiary, dir: SortEvent): number =>{
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.genderInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.genderInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    nationality: (a: Beneficiary, b: Beneficiary, dir: SortEvent): number =>{
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.benNationalityInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.benNationalityInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    sponsors: (a: Beneficiary, b: Beneficiary, dir: SortEvent): number =>{
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.benDependentsCount,
        value2 = !CommonUtils.isValidValue(b) ? '' : b.benDependentsCount;
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  selectBeneficiary(beneficiary: Beneficiary, $event: MouseEvent) {
    $event.preventDefault();
    this.dialogRef.close(beneficiary);
  }
}
