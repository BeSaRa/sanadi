import { Component, Inject } from '@angular/core';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { LicenseActivity } from '@app/models/license-activity';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { InboxService } from '@app/services/inbox.service';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
    selector: 'select-license-activity-popup',
    templateUrl: 'select-license-activity-popup.component.html',
    styleUrls: ['select-license-activity-popup.component.scss']
})
export class SelectLicenseActivityPopupComponent {
    label: keyof ILanguageKeys = 'lbl_license_activities';

    list: LicenseActivity[] =[]
    displayedColumns: string[] = ['licenseNumber','licenseType','actions'];
    constructor(
        public lang: LangService,
        private dialogRef: DialogRef,
        @Inject(DIALOG_DATA_TOKEN) private data: IDialogData<LicenseActivity[]>,
        public inboxService:InboxService
    ) {

        this.list = this.data.model
    }
    actions: IMenuItem<any>[] = [
        // select license/document
        {
            type: 'action',
            label: 'select',
            icon: '',
            onClick: (item: LicenseActivity) => this.selectLicense(item),
        },


    ];
    selectLicense(license: LicenseActivity): void {
        this.dialogRef.close(license);
    }
}
