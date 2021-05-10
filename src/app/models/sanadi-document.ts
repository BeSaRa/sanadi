import {Cloneable} from './cloneable';

export class SanadiDocument extends Cloneable<SanadiDocument> {
  id: number | undefined;
  documentTitle: string | undefined;
  creatorId: number | undefined;
  lastModifierId: number | undefined;
  createdBy: string | undefined;
  createdOn: string | undefined;
  lastModified: string | undefined;
  lastModifier: string | undefined;
  mimeType: string | undefined;
  contentSize: number | undefined;
  minorVersionNumber: number | undefined;
  majorVersionNumber: number | undefined;
  vsId!: string;
  versionStatus: number | undefined;
  isCurrent: boolean | undefined;
  classDescription: string | undefined;


  getDocClassName(): string {
    return 'SanadiDocument';
  }

  getName(): (string | undefined) {
    return this.documentTitle;
  }
}
