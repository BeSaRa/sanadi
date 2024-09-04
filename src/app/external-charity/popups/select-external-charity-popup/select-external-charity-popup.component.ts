import { Component, inject, Inject } from '@angular/core';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ExternalCharity } from '@app/models/external-charity';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
    selector: 'select-external-charity-popup',
    templateUrl: 'select-external-charity-popup.component.html',
    styleUrls: ['select-external-charity-popup.component.scss']
})
export class SelectExternalCharityPopupComponent {

    models:ExternalCharity[] =[]
    lang= inject(LangService);
    dialogRef=inject(DialogRef);
    constructor(
        @Inject(DIALOG_DATA_TOKEN) private data: IDialogData<ExternalCharity[]>
    ) {

        this.models = this.data.model

    }
    get popupTitle(){
        return this.lang.map.menu_create_external_charity
    }
    displayedColumns: (keyof ExternalCharity | 'actions')[] = ['requestFullSerial', 'suggestedCharityName', 'requestorName', 'actions'];
    actions: IMenuItem<ExternalCharity>[] = [
        // select
        {
          type: 'action',
          label: 'select',
          icon: 'mdi-pen',
          onClick: (item: ExternalCharity) => this.dialogRef.close(item)
        },
     
      ];
}
