import {BaseModel} from './base-model';
import {LangService} from '@services/lang.service';
import {FactoryService} from '@services/factory.service';
import {AttachmentTypeServiceDataService} from '@services/attachment-type-service-data.service';
import {AdminResult} from '@app/models/admin-result';
import {AttachmentType} from '@app/models/attachment-type';
import {FileNetDocument} from '@app/models/file-net-document';
import {AttachmentTypeServiceDataInterceptor} from '@app/model-interceptors/attachment-type-service-data-interceptor';
import {InterceptModel} from '@decorators/intercept-model';
import {LookupService} from '@services/lookup.service';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {CommonUtils} from '@helpers/common-utils';
import {infoSearchFields} from '@helpers/info-search-fields';


const {send, receive} = new AttachmentTypeServiceDataInterceptor();

@InterceptModel({send, receive})
export class AttachmentTypeServiceData extends BaseModel<AttachmentTypeServiceData, AttachmentTypeServiceDataService> {
  attachmentTypeId!: number;
  isRequired: boolean = false;
  serviceId!: number;
  userType!: number;
  customProperties: string = '';
  caseType!: number;
  serviceInfo!: AdminResult;
  userTypeInfo!: AdminResult;
  attachmentTypeInfo!: AttachmentType;
  multi: boolean = false;
  identifier: string = '';

  // temp properties
  parsedCustomProperties?: Record<string, any>;
  service!: AttachmentTypeServiceDataService;
  langService: LangService;
  lookupService: LookupService;

  searchFields: ISearchFieldsMap<AttachmentTypeServiceData> = {
    ...normalSearchFields(['arName', 'enName']),
    requestType: (text) => this.getRequestTypeName().toLowerCase().indexOf(text) > -1
  };

  searchFieldsAttachmentTypePopup: ISearchFieldsMap<AttachmentTypeServiceData> = {
    arName: (text) => (this.serviceInfo.arName ?? '').toLowerCase().indexOf(text) > -1,
    enName: (text) => (this.serviceInfo.enName ?? '').toLowerCase().indexOf(text) > -1,
    requestType: (text) => this.getRequestTypeName().toLowerCase().indexOf(text) > -1,
    required: (text) => (this.isRequired ? this.langService.map.lbl_yes : this.langService.map.lbl_no).toLowerCase().indexOf(text) > -1,
    ...infoSearchFields(['userTypeInfo'])
  };

  constructor() {
    super();
    this.service = FactoryService.getService('AttachmentTypeServiceDataService');
    this.langService = FactoryService.getService('LangService');
    this.lookupService = FactoryService.getService('LookupService');
  }

  convertToAttachment(): FileNetDocument {
    let attachment = this.attachmentTypeInfo.convertToAttachment();
    attachment.required = this.isRequired;
    return attachment;
  }

  getRequestTypeName(): string {
    const requestType = this.parsedCustomProperties?.requestType;
    if (!CommonUtils.isValidValue(requestType)) {
      return '';
    }
    return this.lookupService.findLookupByLookupKey(this.lookupService.listByCategory.AllRequestTypes, requestType)?.getName() ?? '';
  }
}
