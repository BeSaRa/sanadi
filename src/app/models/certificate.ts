import {BaseModel} from '@app/models/base-model';
import {CertificateService} from '@app/services/certificate.service';
import {FactoryService} from '@app/services/factory.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {Observable} from 'rxjs';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {CertificateInterceptor} from '@app/model-interceptors/certificate-interceptor';
import {InterceptModel} from "@decorators/intercept-model";
import {normalSearchFields} from '@helpers/normal-search-fields';
import {ISearchFieldsMap} from '@app/types/types';
import {LangService} from '@services/lang.service';

const {send, receive} = new CertificateInterceptor();

@InterceptModel({send, receive})
export class Certificate extends BaseModel<Certificate, CertificateService> {
  documentTitle!: string;
  status: boolean = false;
  vsId!: string;
  file: any;

  // extra properties
  service: CertificateService;
  langService: LangService;

  searchFields: ISearchFieldsMap<Certificate> = {
    ...normalSearchFields(['documentTitle']),
    status: text => this.getStatusText().toLowerCase().indexOf(text) > -1
  };

  constructor() {
    super();
    this.service = FactoryService.getService('CertificateService');
    this.langService = FactoryService.getService('LangService');
  }

  buildForm(controls?: boolean): any {
    const {
      documentTitle,
      status,
      vsId
    } = this;
    return {
      documentTitle: controls ? [documentTitle, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)
      ]] : documentTitle,
      status: controls ? [status] : status,
      vsId: controls ? [vsId] : vsId,
    }
  }

  createTemplate() {
    return this.vsId ? this.service.updateTemplate(this) : this.service.createTemplate(this);
  }

  viewTemplate(): Observable<DialogRef> {
    return this.service.viewTemplateDialog(this);
  }

  deleteTemplate() {
    return this.service.deleteTemplate(this.vsId);
  }

  getStatusText(): string {
    return this.status ? this.langService.map.lbl_active : this.langService.map.lbl_inactive;
  }
}
