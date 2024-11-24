import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { CaseTypes } from '@app/enums/case-types.enum';
import { FileIconsEnum, FileMimeTypesEnum } from '@app/enums/file-extension-mime-types-icons.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { AdminResult } from '@app/models/admin-result';
import { AttachmentTypeServiceData } from '@app/models/attachment-type-service-data';
import { FileNetDocument } from '@app/models/file-net-document';
import { GlobalSettings } from '@app/models/global-settings';
import { AttachmentTypeService } from '@app/services/attachment-type.service';
import { DialogService } from '@app/services/dialog.service';
import { ExternalCharityAttachmentsService } from '@app/services/external-charity-attachment.service';
import { GlobalSettingsService } from '@app/services/global-settings.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { BehaviorSubject, map, Observable, of, startWith, Subject, switchMap, take, takeUntil, tap } from 'rxjs';

@Component({
    selector: 'external-charity-attachments',
    templateUrl: 'external-charity-attachments.component.html',
    styleUrls: ['external-charity-attachments.component.scss']
})
export class ExternalCharityAttachmentsComponent implements OnInit, OnDestroy {

    lang = inject(LangService);
    globalSettingsService = inject(GlobalSettingsService);
    globalSettings: GlobalSettings = this.globalSettingsService.getGlobalSettings();
    attachmentTypeService = inject(AttachmentTypeService);
    dialog = inject(DialogService);
    toast = inject(ToastService);
    externalCharityAttachmentsService = inject(ExternalCharityAttachmentsService);
    allowedExtensions: string[] = [];


    displayedColumns: string[] = ['icon', 'attachmentTypeId', 'documentTitle','mandatory', 'date', 'actions'];

    filter: UntypedFormControl = new UntypedFormControl();
    allowedFileMaxSize: number = this.globalSettings.fileSize;
    ngOnInit(): void {
        this._setAllowedFiles();
        this._listenToReload()
        this._listenToAllRequired();
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.destroy$.unsubscribe();

    }

    @Input({ required: true }) attachments: FileNetDocument[] = []
    @Input() requestId?: number;
    @Input() isAllRequired$= new BehaviorSubject<boolean>(false);

    mergedAttachments : FileNetDocument[] = []

    destroy$ = new Subject<void>();
    private _setAllowedFiles() {
        this._getAllowedExtensionsTypes().subscribe(list => {
            this.allowedExtensions = list;
        })
    }
    private _getAllowedExtensionsTypes() {
        return this.globalSettingsService.getAllowedFileTypes()
            .pipe(
                map(fileTypes => fileTypes.map(fileType => '.' + (fileType.extension ?? '').toLowerCase()))
            )

    }

    reload$ = new BehaviorSubject<any>(null);

    private _listenToAllRequired(){
        this.isAllRequired$.pipe(
            tap(value=>{
                if(value){
                    this.attachments.map(attachment => attachment.required = true);
                }else{
                    this.attachments.map(attachment => attachment.required = false);
                }
            }),
            takeUntil(this.destroy$)
        ).subscribe();
    }
    private _listenToReload(): void {
        this.reload$
            .pipe(
                switchMap(_ => this.attachmentTypeService.loadTypesByCaseType(CaseTypes.ESTABLISHMENT_OF_CHARITY)),
                map((types) => types.map(type => type.convertToAttachment().setAttachmentTypeServiceData(type))),
                // map((types) => this._mergeAttachments(types)),
                takeUntil(this.destroy$)
            )
            .subscribe((attachments) => {
                this.mergedAttachments = [...this.attachments,...attachments];
            });
    }
   
    private _getFileIconsEnumKey(mimeType: string) {
        try {
            const fileTypeKey = Object.keys(FileMimeTypesEnum)[Object.values(FileMimeTypesEnum).indexOf(mimeType as FileMimeTypesEnum)];
            return !fileTypeKey ? FileIconsEnum.HIDDEN : FileIconsEnum[fileTypeKey as keyof typeof FileIconsEnum];
        } catch (_) {
            return FileIconsEnum.HIDDEN;
        }
    }

    getFileIcon(attachment: FileNetDocument): string {
        if (!attachment.id) {
            return FileIconsEnum.HIDDEN;
        } else {
            return this._getFileIconsEnumKey(attachment.mimeType);
        }
    }

    selectedFile?: FileNetDocument;
    selectedIndex!: number;
    uploadAttachment(row: FileNetDocument, uploader: HTMLInputElement): void {
        uploader.click();
        this.selectedFile = row;
        this.selectedIndex = this.mergedAttachments.indexOf(row);
    }

    uploaderFileChange($event: Event): void {
        const input = ($event.target as HTMLInputElement);
        const file = input.files?.item(0);
        if (!file) {
            return;
        }
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

        of(null)
            .pipe(
                takeUntil(this.destroy$),
                switchMap(_ => this.selectedFile?.id ? this._updateAttachmentFile(input.files!) : this._createAttachmentFile(input.files!))
            ).subscribe((file) => {
                input.value = '';
                this._afterSaveAttachmentFile(file);
            });


    }

    private _createAttachmentFile(filesList: FileList | undefined): Observable<FileNetDocument> {
        const document = new FileNetDocument().clone({
            documentTitle: filesList?.item(0)?.name??"",
            description: this.selectedFile?.description,
            attachmentTypeId: this.selectedFile?.attachmentTypeId,
            files: filesList,
        })
        return this.externalCharityAttachmentsService.addDocument(this.requestId!, document)
    }
    private _updateAttachmentFile(filesList: FileList | undefined): Observable<FileNetDocument> {
        const document = new FileNetDocument().clone({
            documentTitle: filesList?.item(0)?.name?? "",
            description: this.selectedFile?.description,
            attachmentTypeId: this.selectedFile?.attachmentTypeId,
            id: this.selectedFile?.id,
            vsId :this.selectedFile?.vsId,
            files: filesList,
        })
        return this.externalCharityAttachmentsService.updateDocument(this.requestId!, document)
    }
    private _afterSaveAttachmentFile(file: FileNetDocument) {
        this.toast.success(this.lang.map.files_have_been_uploaded_successfully);
       this.mergedAttachments[this.selectedIndex] = new FileNetDocument().clone({...file,
        attachmentTypeInfo : AdminResult.createInstance(this.selectedFile!.attachmentTypeInfo??{})
       });
       this.mergedAttachments = this.mergedAttachments.slice()

    }

    viewFile(file: FileNetDocument): void {
        this.externalCharityAttachmentsService.downloadDocument(file.vsId)
            .pipe(
                map(model => this.externalCharityAttachmentsService.viewDocument(model, file)),
                take(1)
            )
            .subscribe();
    }
    deleteFile(file: FileNetDocument): void {
        this.dialog.confirm(this.lang.map.msg_confirm_delete_x.change({ x: file.documentTitle }))
            .onAfterClose$.subscribe((userClick: UserClickOn) => {
                if (userClick !== UserClickOn.YES) {
                    return;
                }

                this.externalCharityAttachmentsService.deleteDocument(file.vsId)
                    .subscribe(() => {
                        this.toast.success(this.lang.map.msg_delete_x_success.change({ x: file.documentTitle }));
                        const isMoreThenOne = this.mergedAttachments.filter(x=>x.attachmentTypeId === file.attachmentTypeId).length > 1;
                        if(isMoreThenOne){
                            this.mergedAttachments = this.mergedAttachments.filter(x=>x.vsId !== file.vsId);
                            return;
                        }
                        let deletedFileIndex = this.mergedAttachments.indexOf(file);
                        this.mergedAttachments.splice(deletedFileIndex, 1, (new FileNetDocument()).clone({
                            documentTitle: file.documentTitle,
                            description: file.description,
                            attachmentTypeId: file.attachmentTypeId,
                            attachmentTypeInfo: file.attachmentTypeInfo,
                        }));
                        this.mergedAttachments = this.mergedAttachments.slice();
                    });
            });

    }
    
}
