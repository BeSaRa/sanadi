import {Component, Inject} from '@angular/core';
import {SharedModule} from '@app/shared/shared.module';
import {GlobalSettings} from '@models/global-settings';
import {FileExtensionsEnum} from '@enums/file-extension-mime-types-icons.enum';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {GlobalSettingsService} from '@services/global-settings.service';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@contracts/i-dialog-data';
import {DialogService} from '@services/dialog.service';
import {LangService} from '@services/lang.service';

@Component({
  selector: 'qcb-files-popup',
  templateUrl: './qcb-files-popup.component.html',
  styleUrl: './qcb-files-popup.component.scss'
})
export class QcbFilesPopupComponent {

  globalSettings: GlobalSettings = this.globalSettingsService.getGlobalSettings();
  allowedFileMaxSize: number = this.globalSettings.fileSize * 1000 * 1024;
  extensions: FileExtensionsEnum[] = [];
  document?: File;
  titleKey: keyof ILanguageKeys;
  consentDocument?: File;

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
    this.extensions = data.extensions ?? [FileExtensionsEnum.PDF];
  }


  uploadFile(): void {
    if (!this.isValidFormUploader()) {
      this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
      return;
    }
    this.dialogRef.close({file: this.document, consentFile: this.consentDocument});
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
  setConsentFile(file: File | File[] | undefined): void {
    if (!file || file instanceof File) {
      this.consentDocument = file;
    } else {
      this.consentDocument = file[0];
    }
  }
}
