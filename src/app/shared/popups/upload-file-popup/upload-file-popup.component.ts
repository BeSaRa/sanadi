import { Component, OnInit } from '@angular/core';
import { FileExtensionsEnum } from '@app/enums/file-extension-mime-types-icons.enum';
import { GlobalSettings } from '@app/models/global-settings';
import { DialogService } from '@app/services/dialog.service';
import { GlobalSettingsService } from '@app/services/global-settings.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';

@Component({
  selector: 'app-upload-file-popup',
  templateUrl: './upload-file-popup.component.html',
  styleUrls: ['./upload-file-popup.component.scss']
})
export class UploadFilePopupComponent implements OnInit {

  globalSettings: GlobalSettings = this.globalSettingsService.getGlobalSettings();
  allowedFileMaxSize: number = this.globalSettings.fileSize * 1000 * 1024;
  extensions: FileExtensionsEnum[] = [FileExtensionsEnum.PDF, FileExtensionsEnum.JPEG, FileExtensionsEnum.JPG, FileExtensionsEnum.PNG];
  document?: File;

  constructor(private dialogRef: DialogRef, private globalSettingsService: GlobalSettingsService, private toast: ToastService, private dialog: DialogService, public lang: LangService) { }
  ngOnInit() {
  }

  uploadFile(): void {
    if (!this.isValidFormUploader()) {
      this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
      return;
    }
    this.toast.success(this.lang.map.files_have_been_uploaded_successfully);
    this.dialogRef.close(this.document);
    return;
  }

  isValidFormUploader(): boolean {
    return !!(this.document);
  }

  closeDialog() {
    this.dialogRef.close(false);
  }

  setFile(file: File | File[] | undefined): void {
    if (!file || file instanceof File) {
      this.document = file;
    } else {
      this.document = file[0];
    }
  }
}
