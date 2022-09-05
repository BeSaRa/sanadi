import {AbstractConstructor} from '@app/helpers/abstract-constructor';
import {Constructor} from '@app/helpers/constructor';
import {AdminResult} from '@app/models/admin-result';
import {FileNetDocumentContract} from '@contracts/file-net-document.contract';
import {DialogService} from '@services/dialog.service';
import {LangService} from '@services/lang.service';
import {FactoryService} from '@services/factory.service';
import {FileIconsEnum, FileMimeTypesEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {ILanguageKeys} from '@contracts/i-language-keys';

type canFileNetDocument = Constructor<FileNetDocumentContract> & AbstractConstructor<FileNetDocumentContract>;

export function mixinFileNetDocument<T extends AbstractConstructor<{}>>(bas: T): canFileNetDocument & T;
export function mixinFileNetDocument<T extends Constructor<{}>>(bas: T): canFileNetDocument & T {
  return class extends bas {
    id!: string;
    createdOn!: string;
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
    itemId!: string;
    // not related to the model
    required?: boolean = false;
    files?: FileList;
    dialog?: DialogService;
    attachmentTypeInfo!: AdminResult;
    langService: LangService;
    gridName?: string;

    constructor(...args: any[]) {
      super(args);
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
      return this.isInternal ? 'internal' : 'external';
    }

    getRequiredTranslate(): string {
      return this.langService.getLocalByKey(this.required ? 'lbl_yes' : 'lbl_no').getName();
    }

    normalizeItemId(): void {
      if (this.itemId) {
        this.gridName = this.itemId.split('|').shift();
        this.itemId = this.itemId.split('|').pop()!;
      }
    }

    denormalizeItemId(): void {
      if (this.itemId) {
        this.itemId = this.gridName + '|' + this.itemId;
      }
    }
  };
}
