import { Component, Inject, inject, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { FileExtensionsEnum } from '@app/enums/file-extension-mime-types-icons.enum';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { BaseGenericEService } from '@app/generics/base-generic-e-service';
import { IWFResponse } from '@app/interfaces/i-w-f-response';
import { CaseModel } from '@app/models/case-model';
import { FileNetDocument } from '@app/models/file-net-document';
import { GlobalSettings } from '@app/models/global-settings';
import { PenaltiesAndViolations } from '@app/models/penalties-and-violations';
import { DialogService } from '@app/services/dialog.service';
import { GlobalSettingsService } from '@app/services/global-settings.service';
import { InboxService } from '@app/services/inbox.service';
import { LangService } from '@app/services/lang.service';
import { PenaltiesAndViolationsService } from '@app/services/penalties-and-violations.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';
import { filter, Observable, of, Subject, switchMap, tap } from 'rxjs';

@Component({
    selector: 'penalty-final-approve-popup',
    templateUrl: 'penalty-final-approve-popup.component.html',
    styleUrls: ['penalty-final-approve-popup.component.scss']
})
export class PenaltyFinalApprovePopupComponent implements OnInit {
    lang = inject(LangService);
    customValidators = CustomValidators;
    comment = new UntypedFormControl('', [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
    done$ = new Subject<void>();
    toast = inject(ToastService);
    dialogRef = inject(DialogRef);
    dialog = inject(DialogService);
    inboxService = inject(InboxService);
    model!: PenaltiesAndViolations;
    fileList?: FileList | null
    constructor(
        @Inject(DIALOG_DATA_TOKEN) private data: {
            taskId: string,
            task: PenaltiesAndViolations,
            service: PenaltiesAndViolationsService,
        },
    ) {
        this.model = data.task;
    }
    ngOnInit(): void {
       this.listenToTakeAction();
    }
    private listenToTakeAction() {
        this.done$
            .pipe(
                // emit only if the beforeSave returned true
                filter(_ => this.comment.valid),
                switchMap(() => this.proceed())
            )
            .subscribe(() => {
                this.toast.success(this.lang.map.process_has_been_done_successfully);
                this.dialogRef.close(true);
            });
    }

    proceed(): Observable<boolean> {
        let responseInfo: Partial<IWFResponse> = {
            selectedResponse: WFResponseType.FINAL_APPROVE,
            comment: this.comment.value ? this.comment.value : undefined
        }, stream$ = of(null);



        return stream$.pipe(
            filter(_ => !!this.fileList),
            switchMap(_=>this._createAttachmentFile(this.fileList!)),
            tap(_=>this._afterSaveAttachmentFile(this.model!)),
            filter(_=>!!this.model.exportedLicenseId),
            switchMap(_ => {
                return this.inboxService.takeActionOnTask(this.data.taskId, responseInfo, this.data.service)
            })
        )
    }

    uploadAttachment(uploader: HTMLInputElement): void {
        if (!this.model!.id) {
            this.dialog.info(
                this.lang.map.this_action_cannot_be_performed_before_saving_the_request
            );
            return;
        }
        uploader.click();
    }
    allowedExtensions: string[] = [FileExtensionsEnum.DOCX, FileExtensionsEnum.DOC];

    globalSettingsService = inject(GlobalSettingsService)
    globalSettings: GlobalSettings = this.globalSettingsService.getGlobalSettings();
    allowedFileMaxSize: number = this.globalSettings.fileSize

    uploaderFileChange($event: Event): void {
        const input = ($event.target as HTMLInputElement);
        const file = input.files?.item(0);
        const validFile = file ? (this.allowedExtensions.includes(file.name.getExtension())) : true;
        !validFile ? input.value = '' : null;
        if (!validFile) {
            this.dialog.error(this.lang.map.msg_only_those_files_allowed_to_upload.change({ files: this.allowedExtensions.join(', ') }));
            input.value = '';
            return;
        }
        const validFileSize = file ? (file.size <= this.allowedFileMaxSize * 1000 * 1024) : true;
        !validFileSize ? input.value = '' : null;
        if (!validFileSize) {
            this.dialog.error(this.lang.map.msg_only_this_file_size_or_less_allowed_to_upload.change({ size: this.allowedFileMaxSize }));
            input.value = '';
            return;
        }
        this.fileList = input.files
    }
    private _createAttachmentFile(filesList: FileList | undefined) {
        return this.data.service.uploadPenaltyBook(this.model!, (new FileNetDocument()).clone({
            documentTitle: this.lang.map.lbl_final_report,
            description: this.lang.map.lbl_final_report,
            attachmentTypeId: -1,
            required: false,
            isPublished: false,
            files: filesList
        }));
    }
    private _afterSaveAttachmentFile(model: PenaltiesAndViolations) {
       this.model = model
    }

}
