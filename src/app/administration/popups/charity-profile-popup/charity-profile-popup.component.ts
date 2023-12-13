import { Component, Inject } from '@angular/core';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { CharityOrganization } from '@app/models/charity-organization';
import { LangService } from '@app/services/lang.service';
import { TabComponent } from '@app/shared/components/tab/tab.component';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { TabMap } from '@app/types/types';

@Component({
  selector: 'charity-profile-popup',
  templateUrl: 'charity-profile-popup.component.html',
  styleUrls: ['charity-profile-popup.component.scss']
})
export class CharityProfilePopupComponent {
  model!: CharityOrganization;
  branchesDisplayColumns: string[] = ['fullName', 'address', 'streetNumber', 'zoneNumber', 'buildingNumber'];
  complianceOfficersDisplayColumns: string[] = ['fullName', 'identificationNumber', 'email', 'phoneNumber', 'extraPhoneNumber'];
  contactOfficersDisplayColumns: string[] = ['fullName', 'identificationNumber', 'email', 'phoneNumber', 'extraPhoneNumber'];

  constructor(public dialogRef: DialogRef,
    public lang: LangService,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<CharityOrganization>) {
    this.model = data.model;
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
    branches: {
      name: 'branches',
      langKey: 'internal_branches',
      index: 1,
      validStatus: () => true,
      isTouchedOrDirty: () => true,

    },
    complianceOfficers: {
      name: 'complianceOfficers',
      langKey: 'complaince_office_data',
      index: 1,
      validStatus: () => true,
      isTouchedOrDirty: () => true,

    },
    contactOfficers: {
      name: 'contactOfficers',
      langKey: 'contact_officers',
      index: 2,
      validStatus: () => true,
      isTouchedOrDirty: () => true,

    },
  };
}
