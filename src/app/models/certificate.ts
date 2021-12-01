import {BaseModel} from '@app/models/base-model';
import {CertificateService} from '@app/services/certificate.service';
import {FactoryService} from '@app/services/factory.service';
import {CustomValidators} from '@app/validators/custom-validators';

export class Certificate extends BaseModel<Certificate, CertificateService> {
  service: CertificateService;
  documentTitle!: string;
  status!: boolean;
  vsId!: string;

  constructor() {
    super();
    this.service = FactoryService.getService('CertificateService');
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
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM')
      ]] : documentTitle,
      status: controls ? [status] : status,
      vsId: controls ? [vsId] : vsId,
    }
  }
}
