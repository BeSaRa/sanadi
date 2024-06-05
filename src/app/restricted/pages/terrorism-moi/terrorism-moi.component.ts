import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { BannedPersonRequestStatus } from '@app/enums/banned-person-request-status.enum';
import { FileExtensionsEnum } from '@app/enums/file-extension-mime-types-icons.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { BannedPersonTerrorism } from '@app/models/BannedPersonTerrorism';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { BannedPersonService } from '@app/services/banned-person.service';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { concatMap, filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';

@Component({
    selector: 'terrorism-moi',
    templateUrl: 'terrorism-moi.component.html',
    styleUrls: ['terrorism-moi.component.scss']
})
export class TerrorismMoiComponent {



    title: keyof ILanguageKeys = 'lbl_approval_requests';

    get reloadFn() {
        return () => this.bannedPersonService.getMOIByRequestStatus(BannedPersonRequestStatus.IN_PROGRESS);
    }
    bannedPersonService = inject(BannedPersonService);
    dialog = inject(DialogService);
    toast = inject(ToastService);
    lang = inject(LangService);
    
    list$: BehaviorSubject<BannedPersonTerrorism[]> = new BehaviorSubject<BannedPersonTerrorism[]>([]);
    resetUploader$ = new Subject();

    reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    displayedColumns: (keyof BannedPersonTerrorism)[] = ['requestFullSerial', 'registrationNo', 'documentType', 'documentNumber', 'name', 'nationality']
    
    allowedExtensions = [FileExtensionsEnum.CSV, FileExtensionsEnum.XLSX, FileExtensionsEnum.XLS];


    fileChange(event: File | File[] | undefined) {
        if (!event) return;
        const files = Array.isArray(event) ? event : [event];

        this.dialog.confirm(this.lang.map.msg_confirm_upload_terrorism_moi)
            .onAfterClose$
            .pipe(
                tap(_=>{this.resetUploader$.next()}),
                filter(click => click === UserClickOn.YES),
                switchMap(_ => this.bannedPersonService.UploadMoiFiles(files)),
                tap(_ => { this.reload$.next(null) }),
                tap(_ => this.toast.success(this.lang.map.upload_files_success)),
                take(1)
            ).subscribe();

    }
    private _approve(requestFullSerial: string): void {
        this.bannedPersonService.approveMoi(requestFullSerial)
            .pipe(
                take(1),
                tap(_ => { this.reload$.next(null) }),
                tap(_ => { this.toast.success(this.lang.map.msg_approved_success) })
            )
            .subscribe();
    }

    approveAll(requestFullSerial: string) {
        this._approve(requestFullSerial)
    }
}
