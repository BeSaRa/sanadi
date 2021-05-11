import {SubventionRequest} from './subvention-request';
import {Beneficiary} from './beneficiary';
import {SubventionAid} from './subvention-aid';
import {SanadiAttachment} from './sanadi-attachment';

export class SubventionResponse {
  request!: SubventionRequest;
  beneficiary!: Beneficiary;
  aidList!: SubventionAid[];
  attachmentList!: SanadiAttachment[];
}
