import {Component, Inject, OnInit} from '@angular/core';
import {Branch} from '@app/models/branch';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@contracts/i-dialog-data';
import {ToastService} from '@services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {LangService} from '@services/lang.service';
import {Officer} from '@app/models/officer';

@Component({
  selector: 'branch-officers-popup',
  templateUrl: './branch-officers-popup.component.html',
  styleUrls: ['./branch-officers-popup.component.scss']
})
export class BranchOfficersPopupComponent implements OnInit {
  model: Branch;
  tempModel: Branch = new Branch();
  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<Branch>,
              private toast: ToastService,
              private dialogRef: DialogRef,
              public langService: LangService) {
    this.model = data.model;
    this.tempModel = (new Branch()).clone(this.model);
  }

  ngOnInit(): void {
  }

  saveOfficers() {
    this.dialogRef.close(this.tempModel);
  }

  onBranchOfficersChanged(officers: Officer[]) {
    this.tempModel.branchContactOfficer = officers;
  }
}
