import { Component, Inject } from '@angular/core';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { FinalExternalOfficeApprovalResult } from '@app/models/final-external-office-approval-result';
import { NpoData } from '@app/models/npo-data';
import { FinalExternalOfficeApprovalService } from '@app/services/final-external-office-approval.service';
import { LangService } from '@app/services/lang.service';
import { TabComponent } from '@app/shared/components/tab/tab.component';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { TabMap } from '@app/types/types';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-npo-profile-popup',
  templateUrl: './npo-profile-popup.component.html',
  styleUrls: ['./npo-profile-popup.component.scss']
})
export class NpoProfilePopupComponent {

  model!: NpoData;
  bankAccountsDisplayColumns: string[] = ['bankName', 'accountNumber', 'iBAN']
  realBeneficiaryDisplayColumns: string[] = ['arName', 'enName', 'birthDate', 'birthLocation','passportNumber','passportDate','passportExpiryDate'];
  foundersDisplayColumns: string[] = [ 'fullName','jobTitle','nationality', 'email', 'phone'];
  contactOfficersDisplayColumns: string[] = ['fullName', 'qid', 'email', 'phoneNumber', 'extraPhoneNumber'];

  constructor(public dialogRef: DialogRef,
    public lang: LangService,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<NpoData>,
    private finalExternalOfficeApprovalService: FinalExternalOfficeApprovalService) {
    this.model = data.model;
  }
  ngOnInit(): void {
    this.externalOffices$ = this.finalExternalOfficeApprovalService.licenseSearch({
      organizationId: this.model.profileId,
    });
  }
  onTabChange(_$event: TabComponent) {
  }
  tabsData: TabMap = {
    basic: {
      name: 'basic',
      langKey: 'lbl_basic_info',
      index: 0,
      validStatus: () => true,
      isTouchedOrDirty: () => true
    },
    contact: {
      name: 'contact',
      langKey: 'lbl_contact_info',
      index: 0,
      validStatus: () => true,
      isTouchedOrDirty: () => true
    },
    bankAccounts: {
      name: 'bankAccounts',
      langKey: 'bank_accounts',
      index: 1,
      validStatus: () => true,
      isTouchedOrDirty: () => true,

    },
    beneficiaries: {
      name: 'beneficiaries',
      langKey: 'lbl_real_beneficiary',
      index: 1,
      validStatus: () => true,
      isTouchedOrDirty: () => true,

    },
    founders: {
      name: 'founders',
      langKey: 'lbl_founder_members',
      index: 2,
      validStatus: () => true,
      isTouchedOrDirty: () => true,

    },
    contactOfficers: {
      name: 'contactOfficers',
      langKey: 'contact_officers',
      index: 3,
      validStatus: () => true,
      isTouchedOrDirty: () => true,

    },
    internalBranches: {
      name: 'internalBranchesTab',
      langKey: 'internal_branches' as keyof ILanguageKeys,
      index: 4,
      validStatus: () => true,
      isTouchedOrDirty: () => true,
    },
  }
  externalOffices$?: Observable<FinalExternalOfficeApprovalResult[]>;
  externalOfficesColumns = [
    'externalOfficeName',
    'country',
    'region',
    'establishmentDate',
    'actions',
  ];

}
