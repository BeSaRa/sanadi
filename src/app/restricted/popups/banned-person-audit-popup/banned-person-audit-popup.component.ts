import { Component, Inject, inject } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { BannedPersonAudit } from '@app/models/banned-person-audit';
import { LangService } from '@app/services/lang.service';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Subject } from 'rxjs';

@Component({
    selector: 'banned-person-audit-popup',
    templateUrl: 'banned-person-audit-popup.component.html',
    styleUrls: ['banned-person-audit-popup.component.scss']
})
export class BannedPersonAuditPopupComponent {

    title:keyof ILanguageKeys  = 'logs'
    list: BannedPersonAudit[] = []
    filterControl: UntypedFormControl = new UntypedFormControl('');
    destroy$: Subject<void> = new Subject();
    displayedColumns:(keyof BannedPersonAudit )[] =['internalUserId','departmentInfo','statusDateModified','auditOperationInfo']    ;
    allowReload: boolean = false;
    lang = inject(LangService);
    constructor(
        @Inject(DIALOG_DATA_TOKEN) data: IDialogData<BannedPersonAudit[]>,
    ) {
        this.list =data.model;
    }
}
