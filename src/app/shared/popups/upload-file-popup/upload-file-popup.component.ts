import {ILanguageKeys} from '@contracts/i-language-keys';
import {Component, Inject} from '@angular/core';
import {FileExtensionsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {GlobalSettings} from '@app/models/global-settings';
import {DialogService} from '@app/services/dialog.service';
import {GlobalSettingsService} from '@app/services/global-settings.service';
import {LangService} from '@app/services/lang.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';

@Component({
  selector: 'app-upload-file-popup',
  templateUrl: './upload-file-popup.component.html',
  styleUrls: ['./upload-file-popup.component.scss']
})
export class UploadFilePopupComponent {

  globalSettings: GlobalSettings = this.globalSettingsService.getGlobalSettings();
  allowedFileMaxSize: number = this.globalSettings.fileSize * 1000 * 1024;
  extensions: FileExtensionsEnum[] = [];
  document?: File;
  titleKey: keyof ILanguageKeys;
  labelKey: keyof ILanguageKeys;
  isRequired: boolean;

  constructor(private dialogRef: DialogRef,
              private globalSettingsService: GlobalSettingsService,
              @Inject(DIALOG_DATA_TOKEN) data: IDialogData<{
                title: keyof ILanguageKeys,
                label: keyof ILanguageKeys,
                required: boolean,
                extensions: FileExtensionsEnum[]
              }>,
              private dialog: DialogService,
              public lang: LangService) {
    this.titleKey = data.title ?? 'file_uploader';
    this.labelKey = data.label ?? 'file';
    this.isRequired = data.required;
    this.extensions = data.extensions ?? [FileExtensionsEnum.PDF];
  }

  uploadFile(): void {
    if (!this.isValidFormUploader()) {
      this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
      return;
    }
    this.dialogRef.close(this.document);
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
