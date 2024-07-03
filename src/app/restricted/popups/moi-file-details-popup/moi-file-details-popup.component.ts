import { Component, Inject, inject } from '@angular/core';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { BannedPersonTerrorism } from '@app/models/BannedPersonTerrorism';
import { BannedPersonService } from '@app/services/banned-person.service';
import { LangService } from '@app/services/lang.service';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'moi-file-details-popup',
    templateUrl: 'moi-file-details-popup.component.html',
    styleUrls: ['moi-file-details-popup.component.scss']
})
export class MoiFileDetailsPopupComponent {
    lang = inject(LangService);
    bannedPersonService = inject(BannedPersonService);
    popupTitle = this.lang.map.details; 
    constructor( @Inject(DIALOG_DATA_TOKEN) public data: IDialogData<BannedPersonTerrorism[]>) {
        this.list$.next(data.model);
    }
    list$ = new BehaviorSubject<BannedPersonTerrorism[]>([]);
}
