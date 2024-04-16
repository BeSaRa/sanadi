import { Component, Inject } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { InspectionLog } from '@app/models/inspection-log';
import { InspectionSpecialist } from '@app/models/inspection-specialist';
import { InternalUser } from '@app/models/internal-user';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
    selector: 'inspection-logs-popup',
    templateUrl: 'inspection-logs-popup.component.html',
    styleUrls: ['inspection-logs-popup.component.scss']
})
export class InspectionLogsPopupComponent  {
    label: keyof ILanguageKeys = 'inspection_history';
    filterControl: UntypedFormControl = new UntypedFormControl('');

    list: InspectionLog[] = [];
    displayedColumns: string[] = ['inspectorId','inspectionStatus','inspectionDate'];
    constructor(
        public lang: LangService,
        private dialogRef: DialogRef,
        @Inject(DIALOG_DATA_TOKEN) private data: IDialogData<InspectionLog[]> 
    ) {

         this.list = this.data.model
    }

}
