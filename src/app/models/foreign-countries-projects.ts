import { CaseTypes } from '@app/enums/case-types.enum';
import { HasExternalCooperationAuthority } from '@app/interfaces/has-external-cooperation-authority';
import { HasRequestType } from '@app/interfaces/has-request-type';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { mixinLicenseDurationType } from '@app/mixins/mixin-license-duration';
import { mixinRequestType } from '@app/mixins/mixin-request-type';
import { ForeignCountriesProjectsComponent } from '@app/modules/general-services/pages/foreign-countries-projects/foreign-countries-projects.component';
import { FactoryService } from '@app/services/factory.service';
import { ForeignCountriesProjectsService } from '@app/services/foreign-countries-projects.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { AdminResult } from './admin-result';
import { CaseModel } from './case-model';

// tslint:disable-next-line: variable-name
const _RequestType = mixinLicenseDurationType(mixinRequestType(CaseModel));

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
  entityClassification!: string;
  specialExplanation!: string;

  getExternalCooperationAuthority(): number {
    return this.externalCooperationAuthority;
  }
  getRequestType(): number {
    return this.requestType;
  }
  buildExplanation(controls: boolean = false): any {
    const { specialExplanation } = this;
    return {
      specialExplanation: controls ? [specialExplanation, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : specialExplanation,
    }
  }
  buildForm(withControls: boolean): IKeyValue {
    const {
      requestType,
      oldLicenseFullSerial,
      externalCooperationAuthority,
      country,
      justification,
      description,
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
      description: withControls
        ? [description, [CustomValidators.required]]
        : description,
      justification: withControls
        ? [justification, [CustomValidators.required]]
        : justification,
      recommendation,
      entityClassification
    };
  }
}
