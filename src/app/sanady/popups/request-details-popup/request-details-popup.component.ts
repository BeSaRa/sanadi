import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {CustomValidators} from '@app/validators/custom-validators';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {LangService} from '@app/services/lang.service';
import {SubventionRequest} from '@app/models/subvention-request';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {Router} from '@angular/router';
import {DialogService} from '@app/services/dialog.service';
import {SubventionRequestService} from '@app/services/subvention-request.service';
import {SubventionAid} from '@app/models/subvention-aid';
import {SubventionResponse} from '@app/models/subvention-response';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {Beneficiary} from '@app/models/beneficiary';
import {FormControl} from '@angular/forms';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {DateUtils} from '@app/helpers/date-utils';

@Component({
  selector: 'app-request-details-popup',
  templateUrl: './request-details-popup.component.html',
  styleUrls: ['./request-details-popup.component.scss']
})
export class RequestDetailsPopupComponent implements AfterViewInit {
  constructor(@Inject(DIALOG_DATA_TOKEN) public data: IDialogData<SubventionResponse>,
              public langService: LangService,
              private dialogService: DialogService,
              private dialogRef: DialogRef,
              private cd: ChangeDetectorRef,
              private subventionRequestService: SubventionRequestService,
              private router: Router) {
    this.requestDetails = this.data.subventionResponse.request.clone();
    this.beneficiary = this.data.subventionResponse.beneficiary.clone();
    this.aidList = this.data.subventionResponse.aidList.slice();
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  requestDetails!: SubventionRequest;
  aidList!: SubventionAid[];
  beneficiary: Beneficiary;

  userClick: typeof UserClickOn = UserClickOn;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  tabsData: IKeyValue = {
    request: {name: 'request'},
    beneficiary: {name: 'beneficiary'},
    aids: {name: 'aids'}
  };
  headerColumn: string[] = ['extra-header'];
  aidColumns = [
    'approvalDate',
    'requestedAidCategory',
    'requestedAid',
    'estimatedAmount',
    'periodicType',
    'donor',
    'installmentsCount',
    'aidStartPayDate',
    'givenAmount',
    'remainingAmount'
  ];

  addPartialRequest(): void {
    this.dialogService.confirm(this.langService.map.msg_confirm_create_partial_request)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        this.dialogRef.close(true);
        this.router.navigate(['/home/sanady/request/partial', this.requestDetails.id],).then();
      }
    });
  }

}
