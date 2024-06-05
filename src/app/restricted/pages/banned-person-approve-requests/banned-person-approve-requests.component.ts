import { Component } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { BannedPersonRequestStatus } from '@app/enums/banned-person-request-status.enum';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { BannedPerson } from '@app/models/banned-person';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { BaseBannedPersonRequestPage } from '@app/restricted/shared/models/base-banned-person-request-page';
import { Observable } from 'rxjs';
import { filter, switchMap, take, tap } from 'rxjs/operators';

@Component({
    selector: 'banned-person-approve-requests',
    templateUrl: 'banned-person-approve-requests.component.html',
    styleUrls: ['banned-person-approve-requests.component.scss']
})
export class BannedPersonApproveRequestsComponent extends BaseBannedPersonRequestPage {
    title: keyof ILanguageKeys = 'lbl_approval_requests';
    get reloadFn(): () => Observable<BannedPerson[]> {
        return () => this.bannedPersonService.getByRequestStatus(BannedPersonRequestStatus.IN_PROGRESS);
    }
    actions: IMenuItem<BannedPerson>[] = [
        ...this.defaultActions,

         // approve
        {
            type: 'action',
            icon: ActionIconsEnum.APPROVE,
            label: 'approve',
            onClick: (item: BannedPerson) => this._approve(item),
        },
         // reject
        {
            type: 'action',
            icon: ActionIconsEnum.BLOCK,
            label: 'lbl_reject',
            onClick: (item: BannedPerson) => this._reject(item),
        },
         // return
        {
            type: 'action',
            icon: ActionIconsEnum.REASSIGN,
            label: 'lbl_return',
            onClick: (item: BannedPerson) => this._return(item),
        },
    ]
    private _approve(model: BannedPerson) {
        this.bannedPersonService.approve(model.id)
            .pipe(
                take(1),
                tap(_ => { this.reload$.next(null) }),
                tap(_ => { this.toast.success(this.lang.map.msg_approved_success) })
            )
            .subscribe();
    }
    private _reject(model: BannedPerson) {

        this.bannedPersonService.showCommentPopup().onAfterClose$
            .pipe(
                filter(comment=>!!comment),
                switchMap(comment=> this.bannedPersonService.reject(model.id,comment)),
                tap(_ => { this.reload$.next(null) }),
                tap(_ => { this.toast.success(this.lang.map.msg_approved_success) }),
                take(1),
            )
            .subscribe();
    }
    private _return(model: BannedPerson) {

        this.bannedPersonService.showCommentPopup().onAfterClose$
            .pipe(
                filter(comment=>!!comment),
                switchMap(comment=> this.bannedPersonService.return(model.id,comment)),
                tap(_ => { this.reload$.next(null) }),
                tap(_ => { this.toast.success(this.lang.map.msg_returned_success) }),
                take(1),
            )
            .subscribe();
    }
}