import { AfterViewInit, Component, Inject, OnInit, inject } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { BannedPersonRequestStatus } from '@app/enums/banned-person-request-status.enum';
import { BannedPerson } from '@app/models/banned-person';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { BannedPersonService } from '@app/services/banned-person.service';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { BehaviorSubject, Observable, Subject, of, timer } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

@Component({
    selector: 'select-banned-person-popup',
    templateUrl: 'select-banned-person-popup.component.html',
    styleUrls: ['select-banned-person-popup.component.scss']
})
export class SelectBannedPersonPopupComponent {

    lang = inject(LangService);
    bannedPersonService = inject(BannedPersonService);
    dialogRef = inject(DialogRef);
    list$:BehaviorSubject<BannedPerson[]> = new BehaviorSubject<BannedPerson[]>([]);
    reload$ = new BehaviorSubject<any>(null);
    list:BannedPerson[]=[];

    constructor(
        @Inject(DIALOG_DATA_TOKEN) data: { list: BannedPerson[] },
    ) {

        data.list && (this.list$.next(data.list));
    }
   

    get popupTitle(): string {
        return this.lang.map.select
    }
    actions: IMenuItem<BannedPerson>[] = [
        // view
        {
            type: 'action',
            icon: ActionIconsEnum.VIEW,
            label: 'view',
            onClick: (item: BannedPerson) => this._view(item),
        },
        // select
        {
            type: 'action',
            icon: ActionIconsEnum.ACCEPT,
            label: 'select',
            onClick: (item: BannedPerson) => this._select(item),
        },
    ]

    protected _view(model: BannedPerson) {
        this.bannedPersonService.viewDialog(model, false)
            .pipe(take(1))
            .subscribe();
    }
    protected _select(model: BannedPerson) {
        this.dialogRef.close(model);
    }

    get reloadFn() {
        return () => this.list$.asObservable().pipe(take(1)); //
    }
}
