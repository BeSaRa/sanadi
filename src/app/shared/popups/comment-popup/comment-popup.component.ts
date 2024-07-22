import { Component, Inject, OnDestroy } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';
import { Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

@Component({
    selector: 'comment-popup',
    templateUrl: 'comment-popup.component.html',
    styleUrls: ['comment-popup.component.scss']
})
export class CommentPopupComponent implements OnDestroy {
    popupTitle: keyof ILanguageKeys = 'reject_reason';
    comment: UntypedFormControl = new UntypedFormControl('', [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
    save$: Subject<void> = new Subject();
    destroy$: Subject<void> = new Subject();

    constructor(
        public lang: LangService,
        private dialogRef: DialogRef,
        @Inject(DIALOG_DATA_TOKEN) public data: { title?: keyof ILanguageKeys }
    ) {
        data?.title && (this.popupTitle = data.title);
        this._listenToSave()
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.destroy$.unsubscribe();
    }
    private _listenToSave() {
        this.save$.pipe(
            filter(_ => this.comment.valid),
            tap(() => this.dialogRef.close(this.comment.value)),
            takeUntil(this.destroy$)
        ).subscribe();
    }
}
