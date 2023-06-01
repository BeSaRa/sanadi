import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { LangService } from '@app/services/lang.service';
import { DialogService } from '@app/services/dialog.service';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { interval, Observable, Subject } from 'rxjs';
import { concatMap, filter, map, takeUntil, tap } from 'rxjs/operators';
import { AdminResult } from '@app/models/admin-result';
import { BlobModel } from '@app/models/blob-model';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss']
})
export class FileUploaderComponent implements OnInit {
  @Output() fileUploadEvent = new EventEmitter<File | File[] | undefined>();
  @ViewChild('fileUploader') fileUploader!: ElementRef;
  uploadedFile: any;
  uploadedFilePath: any;
  uploadedFileName?: AdminResult;

  uploadedFiles: File[] = [];
  uploadedFilesCount: number = 0;
  private _currentFileList: FileList | null = null;

  @Input() labelKey: keyof ILanguageKeys = 'file';
  @Input() fileInputKey: keyof ILanguageKeys = 'upload_file';
  @Input() isRequired: boolean = false;
  @Input() allowedExtensions: string[] = [];
  @Input() allowMultiple: boolean = false;
  @Input() allowRemoveLoadedFile: boolean = false;
  @Input() readonly = false;
  @Input() allowedFileSize?: number;

  /**
   * @description shows the uploaded file name if single file
   * if allow multiple, shows count of files uploaded
   */
  @Input() showFileName: boolean = true;
  /**
   * @description if show file preview is true, show name will be false automatically
   * if allow multiple is true, show file preview will be false automatically
   */
  @Input() showFilePreview: boolean = false;

  private _loadedFile?: BlobModel;
  @Input()
  set loadedFile(file: BlobModel | undefined) {
    this._loadedFile = file;
  }

  get loadedFile(): BlobModel | undefined {
    return this._loadedFile;
  }

  private _loadedFilePath?: SafeResourceUrl;
  @Input()
  set loadedFilePath(filePath: SafeResourceUrl | undefined) {
    this._loadedFilePath = filePath || undefined;
  }

  get loadedFilePath(): SafeResourceUrl | undefined {
    return this._loadedFilePath;
  }

  isLoadedFileAvailable(): boolean {
    return !!this.loadedFile || !!this.loadedFilePath;
  }

  constructor(public lang: LangService,
    private dialogService: DialogService) {
  }

  ngOnInit(): void {
    if (this.allowMultiple) {
      this.showFileName = true;
      this.showFilePreview = false;
    } else {
      this.showFileName = !this.showFilePreview;
    }
  }

  getCurrentFileList(): FileList | null {
    return this._currentFileList;
  }

  openFileBrowser($event: MouseEvent): void {
    $event?.stopPropagation();
    $event?.preventDefault();
    this.fileUploader?.nativeElement.click();
  }

  private _verifyFile(file: File) {
    const extension = file.name.getExtension().toLowerCase(),
      invalidMessage = this.lang.map.msg_invalid_file_format + '<br/>' + this.lang.map.msg_allowed_formats.change({ formats: this.allowedExtensions.join(', ') });

    if (this.allowedFileSize && !this._checkFileSize(file)) {
      this.dialogService.error(this.lang.map.msg_only_this_file_size_or_less_allowed_to_upload.change({ size: this.allowedFileSize/1000/1024 }));
      this._clearFileUploader();
      this._emitFileChangeEvent(undefined);
      return;
    }
    if (!this.allowedExtensions.includes(extension)) {
      this.dialogService.error(invalidMessage);
      this._clearFileUploader();
      this._emitFileChangeEvent(undefined);
      return;
    }

    let reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      this.uploadedFile = file;
      this.uploadedFilesCount = 1;
      // @ts-ignore
      this.uploadedFilePath = event.target.result as string;
      this.uploadedFileName = AdminResult.createInstance({
        arName: this.uploadedFile.name,
        enName: this.uploadedFile.name
      });
      this._emitFileChangeEvent(this.uploadedFile);
    };
  }

  private _verifyFiles(fileList: FileList): void {
    let failedFilesCount: number = 0;
    const finish: Subject<any> = new Subject();
    interval()
      .pipe(
        tap(index => {
          if (!fileList[index]) {
            finish.next();
            finish.complete();
          }
        }),
        takeUntil(finish),
        map(index => fileList[index]),
        filter((file: File) => {
          let isAllowed: boolean = this.allowedExtensions.includes(file.name.getExtension().toLowerCase());
          if (!isAllowed) {
            failedFilesCount++;
          }
          return isAllowed;
        }),
        concatMap((file) => {
          return new Observable((subscriber) => {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
              this.uploadedFiles.push(file);
              this.uploadedFilesCount++;
              subscriber.next(file);
              subscriber.complete();
            };
          })
        })
      ).subscribe({
        complete: () => {
          if (failedFilesCount > 0) {
            const invalidMessage = this.lang.map.msg_some_files_invalid_file_format + '<br/>' + this.lang.map.msg_allowed_formats.change({ formats: this.allowedExtensions.join(', ') });
            this.dialogService.error(invalidMessage);
          }

          if (failedFilesCount === fileList.length) {
            this._clearFileUploader();
            this._emitFileChangeEvent(undefined);
          } else {
            this.uploadedFileName = AdminResult.createInstance({
              arName: this.lang.getArabicLocalByKey('x_files_chosen').change({ count: this.uploadedFilesCount < 5 ? this.uploadedFilesCount : '5+' }),
              enName: this.lang.getEnglishLocalByKey('x_files_chosen').change({ count: this.uploadedFilesCount < 5 ? this.uploadedFilesCount : '5+' }),
            });
            this._emitFileChangeEvent(this.uploadedFiles);
          }
        }
      })
  }

  onFileSelected($event: Event): void {

    this._clearFileValues();

    let files = ($event.target as HTMLInputElement).files;
    this._currentFileList = files;

    if (!files || files.length === 0) {
      this._clearFileUploader();
      this._emitFileChangeEvent(undefined);
      return;
    }

    if (!this.allowMultiple) {
      this._verifyFile(files[0]);
    } else {
      this._verifyFiles(files);
    }
  }

  private _checkFileSize(file: File) {
    return file.size < this.allowedFileSize!
  }
  private _clearFileValues(): void {
    this.uploadedFile = null;
    this.uploadedFilePath = undefined;
    this.uploadedFileName = undefined;
    this.uploadedFiles = [];
    this.uploadedFilesCount = 0;
  }

  private _clearFileUploader(): void {
    this._clearFileValues();
    this.fileUploader.nativeElement.value = '';
  }

  removeFile($event?: MouseEvent): void {
    $event?.preventDefault();
    this._clearFileUploader();
    this._emitFileChangeEvent(undefined);
  }

  removeLoadedFile($event?: MouseEvent): void {
    $event?.preventDefault();
    this._clearFileUploader();
    this.loadedFilePath = undefined;
    this.loadedFile = undefined;
    this._emitFileChangeEvent(undefined);
  }

  private _emitFileChangeEvent(file: File | File[] | undefined): void {
    this.fileUploadEvent.emit(file);
  }

  showRequiredFileMsg(): boolean {
    if (this.readonly || !this.isRequired) {
      return false;
    }
    return !this.isLoadedFileAvailable() && !this.uploadedFile && this.uploadedFiles.length === 0;
  }
}
