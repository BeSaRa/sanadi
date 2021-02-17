import {AdminResult} from './admin-result';

export class SubventionApprovedAid {
  aidAmount!: number;
  aidLookupInfo!: AdminResult;

  static createInstance(model: any): SubventionApprovedAid {
    return Object.assign(new SubventionApprovedAid, model);
  }
}
