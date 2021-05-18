import {SubventionRequest} from './subvention-request';
import {Beneficiary} from './beneficiary';
import {SubventionAid} from './subvention-aid';
import {SanadiAttachment} from './sanadi-attachment';
import {Cloneable} from './cloneable';

export class SubventionResponse extends Cloneable<SubventionResponse>{
  request!: SubventionRequest;
  beneficiary!: Beneficiary;
  aidList!: SubventionAid[];
  attachmentList!: SanadiAttachment[];
}
