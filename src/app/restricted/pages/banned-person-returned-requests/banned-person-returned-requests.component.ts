import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { BannedPersonRequestStatus } from '@app/enums/banned-person-request-status.enum';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { BannedPerson } from '@app/models/banned-person';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { BaseBannedPersonRequestPage } from '@app/restricted/shared/models/base-banned-person-request-page';
import { Observable } from 'rxjs';
import { concatMap, filter, switchMap, take, tap } from 'rxjs/operators';

@Component({
    selector: 'banned-person-returned-requests',
    templateUrl: 'banned-person-returned-requests.component.html',
    styleUrls: ['banned-person-returned-requests.component.scss']
})
export class BannedPersonReturnedRequestsComponent extends BaseBannedPersonRequestPage {
    title: keyof ILanguageKeys = 'lbl_returned_requests';
    get reloadFn(): () => Observable<BannedPerson[]> {
        return () => this.bannedPersonService.getByRequestStatus(BannedPersonRequestStatus.RETURNED);
    }
    displayedColumns:(keyof BannedPerson |'actions')[] =['registrationNo','documentType','name','nationality','internalUserId','requestNotes','actions']    ;
    actions: IMenuItem<BannedPerson>[] = [
        ...this.defaultActions,
        // edit
        {
            type: 'action',
            icon: ActionIconsEnum.EDIT,
            label: 'lbl_update_and_return',
            onClick: (item: BannedPerson) => this._edit(item),
        },
    ]

    private _edit(item: BannedPerson) {

      
        
        this.bannedPersonService.editDialog(item, false)
            .pipe(
                switchMap(dialogRef => dialogRef.onAfterClose$),
                filter(model=>!!model),
                concatMap(bannedPerson=> this.bannedPersonService.send(bannedPerson.id)),
                tap(_ => { this.reload$.next(null) }),
                tap(_ => { this.toast.success(this.lang.map.msg_returned_success) }),
                take(1)
            )
            .subscribe();
    }
}
