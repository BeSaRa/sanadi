import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { CaseTypes } from '@app/enums/case-types.enum';
import { HasExternalCooperationAuthority } from '@app/interfaces/has-external-cooperation-authority';
import { HasRequestType } from '@app/interfaces/has-request-type';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { mixinLicenseDurationType } from '@app/mixins/mixin-license-duration';
import { mixinRequestType } from '@app/mixins/mixin-request-type';
import { ForeignCountriesProjectsInterceptor } from '@app/model-interceptors/foriegn-countries-projects-interceptor';
import { FactoryService } from '@app/services/factory.service';
import { ForeignCountriesProjectsService } from '@app/services/foreign-countries-projects.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { AdminResult } from './admin-result';
import { CaseModel } from './case-model';
import { ProjectNeeds } from './project-needs';

// tslint:disable-next-line: variable-name
const _RequestType = mixinLicenseDurationType(mixinRequestType(CaseModel));
const interceptor = new ForeignCountriesProjectsInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive
})

export class ForeignCountriesProjects
  extends _RequestType<
  ForeignCountriesProjectsService,
  ForeignCountriesProjects
  >
  implements HasRequestType, HasExternalCooperationAuthority {
  public service!: ForeignCountriesProjectsService;
  constructor() {
    super();
    this.service = FactoryService.getService(
      ForeignCountriesProjectsService.name
    );
  }

  requestType!: number;
  caseType: number = CaseTypes.FOREIGN_COUNTRIES_PROJECTS;
  externalCooperationAuthority!: number;
  externalCooperationAuthorityInfo!: AdminResult;

  country!: number;
  countryInfo!: AdminResult;

  oldLicenseFullSerial!: string;
  needSubject!: string;
  justification!: string;
  description!: string;
  recommendation!: string;
  subject!: string;
  entityClassification!: string;
  projectNeeds!: ProjectNeeds;



  getExternalCooperationAuthority(): number {
    return this.externalCooperationAuthority;
  }
  getRequestType(): number {
    return this.requestType;
  }
  buildExplanation(controls: boolean = false): any {
    const { description } = this;
    return {
      description: controls ? [description, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : description,
    }
  }
  buildForm(withControls: boolean): IKeyValue {
    const {
      requestType,
      oldLicenseFullSerial,
      externalCooperationAuthority,
      country,
      justification,
      subject,
      recommendation,
      needSubject,
      entityClassification
    } = this;
    return {
      oldLicenseFullSerial: withControls
        ? [oldLicenseFullSerial]
        : oldLicenseFullSerial,
      externalCooperationAuthority: withControls
        ? [externalCooperationAuthority, [CustomValidators.required]]
        : externalCooperationAuthority,
      requestType: withControls
        ? [requestType, [CustomValidators.required]]
        : requestType,
      country: withControls ? [country, [CustomValidators.required]] : country,
      needSubject: withControls
        ? [needSubject, [CustomValidators.required]]
        : needSubject,
      subject: withControls
        ? [subject, [CustomValidators.required]]
        : subject,
      justification: withControls
        ? [justification, [CustomValidators.required]]
        : justification,
      recommendation,
      entityClassification
    };
  }
}
