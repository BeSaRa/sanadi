import { Component, Inject } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { GlobalSettings } from '@models/global-settings';
import { FileExtensionsEnum } from '@enums/file-extension-mime-types-icons.enum';
import { ILanguageKeys } from '@contracts/i-language-keys';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { GlobalSettingsService } from '@services/global-settings.service';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { IDialogData } from '@contracts/i-dialog-data';
import { DialogService } from '@services/dialog.service';
import { LangService } from '@services/lang.service';
import { AttachmentService } from '@app/services/attachment.service';
import { AttachmentTypeEnum } from '@app/enums/attachment-type.enum';
import { SubventionRequestAid } from '@app/models/subvention-request-aid';

@Component({
  selector: 'qcb-files-popup',
  templateUrl: './qcb-files-popup.component.html',
  styleUrl: './qcb-files-popup.component.scss',
})
export class QcbFilesPopupComponent {
  globalSettings: GlobalSettings =
    this.globalSettingsService.getGlobalSettings();
  allowedFileMaxSize: number = this.globalSettings.fileSize * 1000 * 1024;
  extensions: FileExtensionsEnum[] = [];
  document?: File;
  titleKey: keyof ILanguageKeys;
  requests: SubventionRequestAid[] = [];
  constructor(
    private dialogRef: DialogRef,
    private globalSettingsService: GlobalSettingsService,
    @Inject(DIALOG_DATA_TOKEN)
    data: IDialogData<{
      title: keyof ILanguageKeys;
      label: keyof ILanguageKeys;
      required: boolean;
      extensions: FileExtensionsEnum[];
      requests: SubventionRequestAid[];
    }>,
    private attachmentService: AttachmentService,
    private dialog: DialogService,
    public lang: LangService
  ) {
    this.titleKey = data.title ?? 'file_uploader';
    this.extensions = data.extensions ?? [FileExtensionsEnum.PDF];
    this.requests = data.requests ?? [];
  }

  uploadFile(): void {
    if (!this.isValidFormUploader()) {
      this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
      return;
    }
    const allowedNDARequests = this.requests
      .reverse()
      .find((request) => request.allowDataSharing);
    if (allowedNDARequests) {
      this.attachmentService
        .loadByRequestId(allowedNDARequests.requestId)
        .subscribe((docs) => {
          const disclosureFormDoc = docs.find(
            (doc) => doc.attachmentType == AttachmentTypeEnum.DISCLOSURE_FORM
          );
          if (disclosureFormDoc) {
            this.dialogRef.close({
              file: this.document,
              vsid: disclosureFormDoc.vsId,
            });
          } else {
            this.dialog.error(this.lang.map.no_disclosure_existed);
          }
        });
    } else {
      this.dialog.error(this.lang.map.no_disclosure_existed);
    }
  }

  isValidFormUploader(): boolean {
    return !!this.document;
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
