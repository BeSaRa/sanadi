import { Component, Inject, OnInit } from '@angular/core';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { CharityOrganization } from '@app/models/charity-organization';
import { FinalExternalOfficeApprovalResult } from '@app/models/final-external-office-approval-result';
import { FinalExternalOfficeApprovalService } from '@app/services/final-external-office-approval.service';
import { LangService } from '@app/services/lang.service';
import { TabComponent } from '@app/shared/components/tab/tab.component';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { TabMap } from '@app/types/types';
import { Observable } from 'rxjs';

@Component({
  selector: 'charity-profile-popup',
  templateUrl: 'charity-profile-popup.component.html',
  styleUrls: ['charity-profile-popup.component.scss']
})
export class CharityProfilePopupComponent  implements OnInit{
  model!: CharityOrganization;
  branchesDisplayColumns: string[] = ['fullName', 'address', 'streetNumber', 'zoneNumber', 'buildingNumber'];
  complianceOfficersDisplayColumns: string[] = ['fullName', 'identificationNumber', 'email', 'phoneNumber', 'extraPhoneNumber'];
  contactOfficersDisplayColumns: string[] = ['fullName', 'qid', 'email', 'phoneNumber', 'extraPhoneNumber'];

  constructor(public dialogRef: DialogRef,
    public lang: LangService,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<CharityOrganization>,
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
      index: 1,
      validStatus: () => true,
      isTouchedOrDirty: () => true
    },
    branches: {
      name: 'branches',
      langKey: 'internal_branches',
      index: 2,
      validStatus: () => true,
      isTouchedOrDirty: () => true,

    },
    complianceOfficers: {
      name: 'complianceOfficers',
      langKey: 'complaince_office_data',
      index: 3,
      validStatus: () => true,
      isTouchedOrDirty: () => true,

    },
    contactOfficers: {
      name: 'contactOfficers',
      langKey: 'contact_officers',
      index: 4,
      validStatus: () => true,
      isTouchedOrDirty: () => true,

    },
    internalBranches: {
      name: 'internalBranchesTab',
      langKey: 'internal_branches' as keyof ILanguageKeys,
      index: 5,
      validStatus: () => true,
      isTouchedOrDirty: () => true,
    },
  };
  externalOffices$?: Observable<FinalExternalOfficeApprovalResult[]>;
  externalOfficesColumns = [
    'externalOfficeName',
    'country',
    'region',
    'establishmentDate',
    'actions',
  ];

}
