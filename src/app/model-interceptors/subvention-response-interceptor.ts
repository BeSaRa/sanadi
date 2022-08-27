import {SanadiAttachment} from '../models/sanadi-attachment';
import {SubventionAid} from '../models/subvention-aid';
import {SanadiAttachmentInterceptor} from './sanadi-attachment-interceptor';
import {SubventionAidInterceptor} from './subvention-aid-interceptor';
import {Beneficiary} from '../models/beneficiary';
import {SubventionRequest} from '../models/subvention-request';
import {BeneficiaryInterceptor} from './beneficiary-interceptor';
import {SubventionRequestInterceptor} from './subvention-request-interceptor';
import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {SubventionResponse} from '@app/models/subvention-response';

export class SubventionResponseInterceptor implements IModelInterceptor<SubventionResponse> {
  receive(model: SubventionResponse): any {
    model.attachmentList = model.attachmentList.map((attachment: any) => {
      return (new SanadiAttachmentInterceptor).receive((new SanadiAttachment().clone(attachment)));
    });
    model.aidList = model.aidList.map((aid: SubventionAid) => {
      return (new SubventionAidInterceptor).receive((new SubventionAid().clone(aid)));
    });
    model.beneficiary = (new BeneficiaryInterceptor).receive(new Beneficiary().clone(model.beneficiary));
    model.request = (new SubventionRequestInterceptor).receive(new SubventionRequest().clone(model.request));
    return model;
  }

  send(model: Partial<SubventionResponse>): any {
    model.attachmentList = !model.attachmentList ? [] : model.attachmentList.map((attachment: any) => {
      return (new SanadiAttachmentInterceptor).send(new SanadiAttachment().clone(attachment));
    });
    model.aidList = !model.aidList ? [] :model.aidList.map((aid: SubventionAid) => {
      return (new SubventionAidInterceptor).send(aid);
    });
    model.beneficiary = (new BeneficiaryInterceptor).send(model.beneficiary);
    model.request = (new SubventionRequestInterceptor).send(model.request);
    return model;
  }
}
