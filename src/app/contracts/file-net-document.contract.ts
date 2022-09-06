import {DialogService} from '@services/dialog.service';
import {AdminResult} from '@app/models/admin-result';
import {LangService} from '@services/lang.service';
import {ILanguageKeys} from '@contracts/i-language-keys';

export interface FileNetDocumentContract {
  id: string;
  createdOn: string;
  attachmentTypeId: number;
  description: string;
  isInternal: boolean;
  isPublished: boolean;
  documentTitle: string;
  mimeType: string;
  contentSize: number;
  minorVersionNumber: number;
  majorVersionNumber: number;
  vsId: string;
  versionStatus: number;
  isCurrent: boolean;
  lockTimeout: string;
  lockOwner: string;
  className: string;
  itemId: string;
  // not related to the model
  required?: boolean;
  files?: FileList;
  dialog?: DialogService;
  attachmentTypeInfo: AdminResult;
  langService: LangService;
  gridName?: string;

  isPdfItem(): boolean;

  getIcon(): string;

  getInternalExternalIcon(): string;

  getInternalExternalTooltip(): keyof ILanguageKeys;

  getRequiredTranslate(): string;

  normalizeItemId(): void;

  denormalizeItemId(): void;
}
