import {BaseModel} from '@app/models/base-model';
import {CertificateService} from '@app/services/certificate.service';
import {FactoryService} from '@app/services/factory.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {Observable} from 'rxjs';
import {DialogRef} from '@app/shared/models/dialog-ref';

export class Certificate extends BaseModel<Certificate, CertificateService> {
  service: CertificateService;
  documentTitle!: string;
  status: boolean = false;
  vsId!: string;
  file: any;

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

  createTemplate() {
    return this.vsId ? this.service.updateTemplate(this) : this.service.createTemplate(this);
  }

  viewTemplate(): Observable<DialogRef> {
    return this.service.viewTemplateDialog(this);
  }

  deleteTemplate() {
    return this.service.deleteTemplate(this.vsId);
  }
}
