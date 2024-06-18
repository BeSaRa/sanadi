import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { BannedPersonRequestStatus } from '@app/enums/banned-person-request-status.enum';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { BannedPerson } from '@app/models/banned-person';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { BaseBannedPersonRequestPage } from '@app/restricted/shared/models/base-banned-person-request-page';
import { CommentPopupComponent } from '@app/shared/popups/comment-popup/comment-popup.component';
import { switchMap, take, tap } from 'rxjs/operators';

@Component({
    selector: 'banned-person-draft',
    templateUrl: 'banned-person-draft.component.html',
    styleUrls: ['banned-person-draft.component.scss']
})
export class BannedPersonDraftComponent extends BaseBannedPersonRequestPage {

    title: keyof ILanguageKeys = 'lbl_draft_requests';

    get reloadFn() {
        return () => this.bannedPersonService.getByRequestStatus(BannedPersonRequestStatus.PENDING)
    }
    actions: IMenuItem<BannedPerson>[] = [

        ...this.defaultActions,
        // edit
        {
            type: 'action',
            icon: ActionIconsEnum.EDIT,
            label: 'btn_edit',
            onClick: (item: BannedPerson) => this._edit(item),
        },
        // send
        {
            type: 'action',
            icon: ActionIconsEnum.LAUNCH,
            label: 'send',
            onClick: (item: BannedPerson) => this._send(item),
        },
        // delete
        {
            type: 'action',
            icon: ActionIconsEnum.DELETE,
            label: 'btn_delete',
            onClick: (item: BannedPerson) => this._delete(item),
        },
    ]


    private _edit(model: BannedPerson) {

        this.bannedPersonService.editDialog(model, false)
            .pipe(
                switchMap(dialogRef => dialogRef.onAfterClose$),
                tap(_ => { this.reload$.next(null) }),
                take(1)
            )
            .subscribe();
    }
    private _send(model: BannedPerson) {
        this.bannedPersonService.send(model.id)
            .pipe(
                take(1),
                tap(_ => { this.reload$.next(null) }),
                tap(_ => { this.toast.success(this.lang.map.msg_send_success) })
            )
            .subscribe();
    }

    private _delete(model: BannedPerson) {
        this.bannedPersonService.terminate(model.id)
            .pipe(
                take(1),
                tap(_ => { this.reload$.next(null) }),
                tap(_ => { this.toast.success(this.lang.map.msg_delete_success) })
            )
            .subscribe();
    }

}
