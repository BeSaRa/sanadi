import {Component, Inject, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {Beneficiary} from '../../../models/beneficiary';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {DialogRef} from '../../../shared/models/dialog-ref';

@Component({
  selector: 'app-select-beneficiary-popup',
  templateUrl: './select-beneficiary-popup.component.html',
  styleUrls: ['./select-beneficiary-popup.component.scss']
})
export class SelectBeneficiaryPopupComponent implements OnInit {
  userClick: typeof UserClickOn = UserClickOn;
  displayedColumns: string[] = ['id', 'arName', 'enName', 'gender', 'nationality', 'sponsors', 'actions'];

  constructor(public langService: LangService,
              @Inject(DIALOG_DATA_TOKEN) public list: Beneficiary[], private dialogRef: DialogRef) {
  }

  ngOnInit(): void {
  }

  selectBeneficiary(beneficiary: Beneficiary, $event: MouseEvent) {
    $event.preventDefault();
    this.dialogRef.close(beneficiary);
  }
}
