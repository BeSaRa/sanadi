import {Component, Inject, inject, OnInit} from '@angular/core';
import {FileIconsEnum} from '@enums/file-extension-mime-types-icons.enum';
import {UntypedFormControl} from '@angular/forms';
import {SubventionRequestAid} from '@models/subvention-request-aid';
import {LangService} from '@services/lang.service';
import {SortEvent} from '@contracts/sort-event';
import {CommonUtils} from '@helpers/common-utils';
import {DateUtils} from '@helpers/date-utils';
import {CustomValidators} from '@app/validators/custom-validators';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {UserClickOn} from '@enums/user-click-on.enum';
import {IDialogData} from '@contracts/i-dialog-data';
import {Beneficiary} from '@models/beneficiary';
import {Pair} from '@contracts/pair';
import {BeneficiarySaveStatus} from '@enums/beneficiary-save-status.enum';
import {BeneficiaryService} from '@services/beneficiary.service';
import {ILanguageKeys} from '@contracts/i-language-keys';

@Component({
  selector: 'confirm-nda-case-popup',
  templateUrl: './confirm-nda-case-popup.component.html',
  styleUrl: './confirm-nda-case-popup.component.scss'
})
export class ConfirmNdaCasePopupComponent implements OnInit {
  langService = inject(LangService);
  beneficiaryService = inject(BeneficiaryService);
  models: SubventionRequestAid[] = [];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  headerColumn: string[] = ['extra-header'];
  displayedColumns: string[] = ['requestFullSerial', 'requestDate', 'organization', 'createdBy', 'requestStatus', 'estimatedAmount', 'requestedAidAmount', 'totalApprovedAmount', 'statusDateModified'];
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  data: IDialogData<Pair<BeneficiarySaveStatus, Beneficiary> | null>;
  sortingCallbacks = {
    requestDate: (a: SubventionRequestAid, b: SubventionRequestAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.creationDate),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.creationDate);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    organization: (a: SubventionRequestAid, b: SubventionRequestAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.orgInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.orgInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    createdBy: (a: SubventionRequestAid, b: SubventionRequestAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.orgUserInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.orgUserInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    requestStatus: (a: SubventionRequestAid, b: SubventionRequestAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    estimatedAmount: (a: SubventionRequestAid, b: SubventionRequestAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidSuggestedAmount,
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidSuggestedAmount;
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    totalApprovedAmount: (a: SubventionRequestAid, b: SubventionRequestAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidTotalPayedAmount,
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidTotalPayedAmount;
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    statusDateModified: (a: SubventionRequestAid, b: SubventionRequestAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.statusDateModified!),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.statusDateModified!);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<Pair<BeneficiarySaveStatus, Beneficiary> | null>) {
    this.data = data;
  }
  ngOnInit(): void {
    this._loadBenStatus()
  }
  get title(): keyof ILanguageKeys {
    return this.data.value.first as keyof ILanguageKeys
  }
  private _loadBenStatus() {
    this.beneficiaryService.beneficiaryStatus(this.data.beneficiary).subscribe((page) => {
      this.models = page.rs
    })
  }

  protected readonly userClick = UserClickOn;
  protected readonly fileIconsEnum = FileIconsEnum;

}
