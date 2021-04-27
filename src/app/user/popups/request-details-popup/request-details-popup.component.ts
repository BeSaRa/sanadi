import {Component, Inject, OnInit} from '@angular/core';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {CustomValidators} from '../../../validators/custom-validators';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {LangService} from '../../../services/lang.service';
import {SubventionRequest} from '../../../models/subvention-request';
import {IDialogData} from '../../../interfaces/i-dialog-data';
import {DialogRef} from '../../../shared/models/dialog-ref';
import {Router} from '@angular/router';
import {DialogService} from '../../../services/dialog.service';

@Component({
  selector: 'app-request-details-popup',
  templateUrl: './request-details-popup.component.html',
  styleUrls: ['./request-details-popup.component.scss']
})
export class RequestDetailsPopupComponent implements OnInit {
  requestDetails!: SubventionRequest;

  userClick: typeof UserClickOn = UserClickOn;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  constructor(@Inject(DIALOG_DATA_TOKEN) public data: IDialogData<SubventionRequest>,
              public langService: LangService,
              private dialogService: DialogService,
              private dialogRef: DialogRef,
              private router: Router) {
    this.requestDetails = this.data.requestData.clone();
  }

  ngOnInit(): void {
  }

  addPartialRequest($event: MouseEvent): void {
    this.dialogService.confirm(this.langService.map.msg_confirm_create_partial_request)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        this.requestDetails.createPartialRequest()
          .subscribe(result => {
            this.dialogRef.close(true);
            this.router.navigate(['/home/main/request', result.id]).then();
          });
      }
    })
  }

}
