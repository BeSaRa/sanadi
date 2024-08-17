import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FileExtensionsEnum } from '@app/enums/file-extension-mime-types-icons.enum';
import { GlobalSettings } from '@app/models/global-settings';
import { DialogService } from '@app/services/dialog.service';
import { GlobalSettingsService } from '@app/services/global-settings.service';
import { LangService } from '@app/services/lang.service';
import { Observable, Subject, takeUntil, tap } from 'rxjs';

@Component({
    selector: 'uploader',
    templateUrl: 'uploader.component.html',
    styleUrls: ['uploader.component.scss']
})
export class UploaderComponent implements AfterViewInit,OnDestroy{

    lang=inject(LangService);
    dialog=inject(DialogService);
    globalSettingsService= inject(GlobalSettingsService);
    globalSettings: GlobalSettings = this.globalSettingsService.getGlobalSettings();
    allowedFileMaxSize: number = this.globalSettings.fileSize;

    @Output() fileChanged = new EventEmitter<File>()


    @Input()allowedExtensions: FileExtensionsEnum[] = [];
    @ViewChild('uploader') uploaderRef!:ElementRef<HTMLInputElement>;

    @Input({required:true})upload$!:Observable<void>
    destroy$ = new Subject<void>();
    ngAfterViewInit(): void {
        this._listenToUpload();
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.destroy$.unsubscribe();
    }
    private _listenToUpload(){
        this.upload$
        .pipe(
            tap(_=>{this.uploaderRef?.nativeElement?.click()}),
            takeUntil(this.destroy$)
        )
        .subscribe()
    }
    uploaderFileChange($event: Event): void {
        const input = ($event.target as HTMLInputElement);
        const file = input.files?.item(0);
        const validFile = file ? (this.allowedExtensions.includes(<FileExtensionsEnum>file.name.getExtension())) : true;
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
    this.fileChanged.emit(file!);
    }
}
