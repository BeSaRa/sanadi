import { Component, Inject } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { InspectionActionLog } from '@app/models/inspection-action-log';
import { LangService } from '@app/services/lang.service';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
    selector: 'inspection-action-log-popup',
    templateUrl: 'inspection-action-log-popup.component.html',
    styleUrls: ['inspection-action-log-popup.component.scss']
})
export class InspectionActionLogPopupComponent {
    label: keyof ILanguageKeys = 'logs_history';
    filterControl: UntypedFormControl = new UntypedFormControl('');

    list: InspectionActionLog[] = [];
    displayedColumns: string[] = ['action','actionDate','userId'];
    constructor(
        public lang: LangService,
        @Inject(DIALOG_DATA_TOKEN) private data: IDialogData<InspectionActionLog[]> 
    ) {

         this.list = this.data.model
    }

}
