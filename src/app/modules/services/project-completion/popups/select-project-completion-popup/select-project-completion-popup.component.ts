import { Component, Inject, inject } from '@angular/core';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ProjectCompletion } from '@app/models/project-completion';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
    selector: 'select-project-completion-popup',
    templateUrl: 'select-project-completion-popup.component.html',
    styleUrls: ['select-project-completion-popup.component.scss']
})
export class SelectProjectCompletionPopupComponent {

    lang=inject(LangService);
    dialogRef = inject(DialogRef);

    constructor(@Inject(DIALOG_DATA_TOKEN) public data: IDialogData<ProjectCompletion[]>){
      data?.model && (this.list = data.model)
    }
    displayedColumns:(keyof ProjectCompletion | 'actions')[] =
    ['fullSerial','workAreaInfo','beneficiaryCountryInfo','projectLicenseSerial','projectName','actions'];

    list: ProjectCompletion[] = []
    actions: IMenuItem<ProjectCompletion>[] = [
    {
        type: 'action',
        label: 'select',
        icon: '',
        onClick: (item: ProjectCompletion) => this.selectLicense(item),
      },
    ];
    selectLicense(project: ProjectCompletion) {
        this.dialogRef.close(project);
      }
}
