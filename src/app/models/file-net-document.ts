import {FileNetModel} from './FileNetModel';

export class FileNetDocument extends FileNetModel<FileNetDocument> {
  documentType!: number;
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
  file!: File;
}
