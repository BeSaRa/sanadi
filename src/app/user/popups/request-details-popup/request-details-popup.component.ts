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
import {SubventionRequestService} from '../../../services/subvention-request.service';
import {SubventionAid} from '../../../models/subvention-aid';
import {SubventionResponse} from '../../../models/subvention-response';
import {IKeyValue} from '../../../interfaces/i-key-value';

@Component({
  selector: 'app-request-details-popup',
  templateUrl: './request-details-popup.component.html',
  styleUrls: ['./request-details-popup.component.scss']
})
export class RequestDetailsPopupComponent implements OnInit {
  requestDetails!: SubventionRequest;
  aidList!: SubventionAid[];

  userClick: typeof UserClickOn = UserClickOn;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  tabsData: IKeyValue = {
    request: {name: 'request'},
    aids: {name: 'aids'}
  };
  aidColumns = [
    'approvalDate',
    'aidLookupId',
    'estimatedAmount',
    'periodicType',
    'installementsCount',
    'aidStartPayDate',
    'givenAmount',
    'remainingAmount'
  ];

  constructor(@Inject(DIALOG_DATA_TOKEN) public data: IDialogData<SubventionResponse>,
              public langService: LangService,
              private dialogService: DialogService,
              private dialogRef: DialogRef,
              private subventionRequestService: SubventionRequestService,
              private router: Router) {
    this.requestDetails = this.data.subventionResponse.request.clone();
    this.aidList = this.data.subventionResponse.aidList.slice();
  }

  ngOnInit(): void {
  }

  addPartialRequest($event: MouseEvent): void {
    this.dialogService.confirm(this.langService.map.msg_confirm_create_partial_request)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        this.dialogRef.close(true);
        this.router.navigate(['/home/main/request/partial', this.requestDetails.id],).then();
      }
    })
  }

}
