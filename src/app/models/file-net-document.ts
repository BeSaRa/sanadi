import {FileNetModel} from './FileNetModel';
import {FactoryService} from '../services/factory.service';
import {DialogService} from '../services/dialog.service';

export class FileNetDocument extends FileNetModel<FileNetDocument> {
  attachmentTypeId!: number;
  description!: string;
  isPublished!: boolean;
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
  files?: FileList;
  dialog?: DialogService;

  constructor() {
    super();
    this.dialog = FactoryService.getService('DialogService');
  }

  getIcon(): string {
    return this.mimeType === 'application/pdf' ? 'mdi-file-pdf-outline' : 'mdi-file-image-outline';
  }
}
