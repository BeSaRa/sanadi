import {BaseModel} from './base-model';

export class AidLookup extends BaseModel {
  category: number | undefined;
  status: boolean | undefined;
  statusDateModified: number | undefined;
  aidType: number | undefined;
  parent: number | undefined;

  create(): void {
  }

  delete(): void {
  }

  save(): void {
  }

  update(): void {
  }
}
