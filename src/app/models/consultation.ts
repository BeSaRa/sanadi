import {CaseModel} from './case-model';
import {ConsultationService} from '../services/consultation.service';
import {FactoryService} from '../services/factory.service';
import {CustomValidators} from '../validators/custom-validators';
import {Validators} from '@angular/forms';

export class Consultation extends CaseModel<ConsultationService, Consultation> {
  caseType: number = 2;
  category!: number;
  email: string = '';
  fullName: string = '';
  mobileNo: string = '';
  organizationId!: number;
  requestBody: string = '';

  service: ConsultationService;

  constructor() {
    super();
    this.service = FactoryService.getService('ConsultationService');
  }

  getFormFields(control: boolean = false): any {
    const {category, organizationId, fullName, mobileNo, email, requestBody} = this;

    return {
      category: control ? [category, [CustomValidators.required]] : category,
      organizationId: control ? [organizationId, [CustomValidators.required]] : organizationId,
      fullName: control ? [fullName, [CustomValidators.required,
        CustomValidators.minLength(4),
        CustomValidators.pattern('ENG_AR_ONLY')]] : fullName,
      mobileNo: control ? [mobileNo, [CustomValidators.required, CustomValidators.number]] : mobileNo,
      email: control ? [email, [CustomValidators.required, Validators.email]] : email,
      requestBody: control ? [requestBody, [CustomValidators.required]] : requestBody
    };
  }
}
