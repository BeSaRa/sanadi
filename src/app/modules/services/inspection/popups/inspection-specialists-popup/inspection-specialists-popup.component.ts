import { Component, Inject } from '@angular/core';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { InspectionSpecialist } from '@app/models/inspection-specialist';
import { InternalUser } from '@app/models/internal-user';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
    selector: 'inspection-specialists-popup',
    templateUrl: 'inspection-specialists-popup.component.html',
    styleUrls: ['inspection-specialists-popup.component.scss']
})
export class InspectionSpecialistsPopupComponent {
    label: keyof ILanguageKeys = 'lbl_inspection_specialists';

    list: InternalUser[] = [
          ];
    displayedColumns: string[] = ['arName','enName','actions'];
    constructor(
        public lang: LangService,
        private dialogRef: DialogRef,
        @Inject(DIALOG_DATA_TOKEN) private data: IDialogData<InspectionSpecialist[]> &
        {
            readonly:boolean,
            users:InternalUser[]
        }
    ) {

         this.list = this.data.users
    }
    actions: IMenuItem<any>[] = [
        // select license/document
        {
            type: 'action',
            label: 'select',
            icon: '',
            onClick: (item: InternalUser) => this.selectSpecialist(item),
        },


    ];
    selectSpecialist(item: InternalUser): void {

        this.dialogRef.close(new InspectionSpecialist().clone({
            internalSpecialist: item
        }));
    }
}

