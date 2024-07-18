import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { BannedPersonRequestStatus } from '@app/enums/banned-person-request-status.enum';
import { FileExtensionsEnum } from '@app/enums/file-extension-mime-types-icons.enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { PermissionsEnum } from '@app/enums/permissions-enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { BannedPersonTerrorism, BannedPersonTerrorismFile } from '@app/models/BannedPersonTerrorism';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { MoiFileDetailsPopupComponent } from '@app/restricted/popups/moi-file-details-popup/moi-file-details-popup.component';
import { BannedPersonService } from '@app/services/banned-person.service';
import { DialogService } from '@app/services/dialog.service';
import { EmployeeService } from '@app/services/employee.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { concatMap, filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';

@Component({
    selector: 'terrorism-moi',
    templateUrl: 'terrorism-moi.component.html',
    styleUrls: ['terrorism-moi.component.scss']
})
export class TerrorismMoiComponent implements OnInit, OnDestroy {
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.destroy$.unsubscribe();
    }
    ngOnInit(): void {
        this.reload$
            .pipe(switchMap(_ => this.bannedPersonService.getMOIFiles()))
            .pipe(tap(list => { this.list$.next(list) }))
            .pipe(takeUntil(this.destroy$))
            .subscribe();
    }

    title: keyof ILanguageKeys = 'lbl_approval_requests';
    filterControl: UntypedFormControl = new UntypedFormControl('');

    get reloadFn() {
        return () => this.bannedPersonService.getMOIFiles();
    }
    bannedPersonService = inject(BannedPersonService);
    dialog = inject(DialogService);
    toast = inject(ToastService);
    lang = inject(LangService);
    employeeService = inject(EmployeeService);

    list$: BehaviorSubject<BannedPersonTerrorismFile[]> = new BehaviorSubject<BannedPersonTerrorismFile[]>([]);
    resetUploader$:Subject<void> = new Subject<void>();

    reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    destroy$:Subject<void> = new Subject<void>();
    displayedColumns: (keyof BannedPersonTerrorismFile | 'actions')[] = ['fileName', 'fileSize', 'itemCount','actions']

    allowedExtensions = [FileExtensionsEnum.CSV, FileExtensionsEnum.XLSX, FileExtensionsEnum.XLS];


    fileChange(event: File | File[] | undefined) {
        if (!event) return;
        const files = Array.isArray(event) ? event : [event];

        this.dialog.confirm(this.lang.map.msg_confirm_upload_terrorism_moi)
            .onAfterClose$
            .pipe(
                tap(_ => { this.resetUploader$.next() }),
                filter(click => click === UserClickOn.YES),
                switchMap(_ => this.bannedPersonService.UploadMoiFiles(files)),
                tap(_ => { this.reload$.next(null) }),
                tap(_ => this.toast.success(this.lang.map.upload_files_success)),
                take(1)
            ).subscribe();
    }
    private _approve(requestFullSerial: string): void {
        
    }



    actions: IMenuItem<BannedPersonTerrorismFile>[] = [

        // view
        {
            type: 'action',
            icon: ActionIconsEnum.VIEW,
            label: 'btn_edit',
            onClick: (item: BannedPersonTerrorismFile) => this._view(item),
        },

    ]

    private _view(item: BannedPersonTerrorismFile) {
        this.bannedPersonService.getMOIByFileName(item.fileName)
            .pipe(
                switchMap(list => this.dialog.show<IDialogData<BannedPersonTerrorism[]>>(
                    MoiFileDetailsPopupComponent, {
                    model: list,
                    operation: OperationTypes.VIEW
                }
                ).onAfterClose$),
                take(1)
            )
            .subscribe()
    }
    approveAll() {
        // this.list$.value[0].
        this.bannedPersonService.approveMoi(this.list$.value[0].requestFullSerial)
            .pipe(
                take(1),
                tap(_ => { this.reload$.next(null) }),
                tap(_ => { this.toast.success(this.lang.map.msg_approved_success) })
            )
            .subscribe();
    }
    rejectAll() {
        this.bannedPersonService.rejectMoi(this.list$.value[0].requestFullSerial)
        .pipe(
            take(1),
            tap(_ => { this.reload$.next(null) }),
            tap(_ => { this.toast.success(this.lang.map.msg_reject_success) })
        )
        .subscribe();
    }

    get canMakeDecision(): boolean {
        return this.employeeService.hasPermissionTo(PermissionsEnum.DECISION_BANNED_PERSON_MOI)
    }
}
