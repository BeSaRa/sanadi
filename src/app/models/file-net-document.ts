import {FileNetModel} from './FileNetModel';
import {FactoryService} from '../services/factory.service';
import {DialogService} from '../services/dialog.service';
import {ILanguageKeys} from "@app/interfaces/i-language-keys";
import {AdminResult} from "@app/models/admin-result";
import {LangService} from "@app/services/lang.service";
import {FileIconsEnum, FileMimeTypesEnum} from '@app/enums/file-extension-mime-types-icons.enum';

export class FileNetDocument extends FileNetModel<FileNetDocument> {
  attachmentTypeId!: number;
  description!: string;
  isInternal!: boolean;
  isPublished: boolean = false;
  documentTitle!: string;
  mimeType!: string;
  contentSize!: number;
  minorVersionNumber!: number;
  majorVersionNumber!: number;
  vsId!: string;
  versionStatus!: number;
  isCurrent!: boolean;
  lockTimeout!: string;
  lockOwner!: string;
  className!: string;
  // not related to the model
  required?: boolean = false;
  files?: FileList;
  dialog?: DialogService;
  attachmentTypeInfo!: AdminResult;
  langService: LangService;

  constructor() {
    super();
    this.dialog = FactoryService.getService('DialogService');
    this.langService = FactoryService.getService('LangService');
  }

  isPdfItem(): boolean {
    return (this.mimeType + '').toLowerCase() === FileMimeTypesEnum.PDF.toLowerCase();
  }

  getIcon(): string {
    return this.isPdfItem() ? FileIconsEnum.PDF : FileIconsEnum.IMAGE;
  }

  getInternalExternalIcon(): string {
    return this.isInternal ? 'mdi-recycle' : 'mdi-arrow-top-right-thick';
  }

  getInternalExternalTooltip(): keyof ILanguageKeys {
    return this.isInternal ? "internal" : "external";
  }

  getRequiredTranslate(): string {
    return this.langService.getLocalByKey(this.required ? 'lbl_yes' : 'lbl_no').getName()
  }
}
