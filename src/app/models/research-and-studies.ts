import { Validators } from '@angular/forms';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { EmployeeService } from '@app/services/employee.service';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { ISearchFieldsMap } from '@app/types/types';
import { IMyDateModel } from 'angular-mydatepicker';
import { ResearchAndStudiesInterceptor } from './../model-interceptors/research-and-studies-interceptor';
import { CustomValidators } from './../validators/custom-validators';
import { SearchableCloneable } from './searchable-cloneable';

const { send, receive } = new ResearchAndStudiesInterceptor();

@InterceptModel({ send, receive })
export class ResearchAndStudies extends SearchableCloneable<ResearchAndStudies> {
  organizationId!: number | undefined;
  researchTopic!: string;
  motivesAndReasons!: string;
  researchAndStudyObjectives!: string;
  expectedResearchResults!: string;
  generalLandmarks!: string;
  requiredRole!: string;
  researcherDefinition!: string;
  financialCost!: number;
  searchStartDate!: string | IMyDateModel;
  searchSubmissionDeadline!: string | IMyDateModel;
  langService?: LangService;

  constructor() {
    super();
    this.employeeService = FactoryService.getService('EmployeeService');
    this.langService = FactoryService.getService('LangService');
  }

  employeeService: EmployeeService;
  searchFields: ISearchFieldsMap<ResearchAndStudies> = {
    ...infoSearchFields([]),
    ...normalSearchFields([
      'researchTopic',
      'motivesAndReasons',
      'researchAndStudyObjectives',
      'expectedResearchResults',
      'generalLandmarks',
      'requiredRole',
      'researcherDefinition',
      'financialCost',
    ]),
  };
  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

  get DisplayedColumns(): string[] {
    return [
      'researchTopic',
      'researchAndStudyObjectives',
      'expectedResearchResults',
      'generalLandmarks',
      'requiredRole',
      'financialCost',
      'actions',
    ];
  }
  BuildForm(controls?: boolean) {
    const {
      researchTopic,
      motivesAndReasons,
      researchAndStudyObjectives,
      expectedResearchResults,
      generalLandmarks,
      searchStartDate,
      searchSubmissionDeadline,
      requiredRole,
      researcherDefinition,
      financialCost,
    } = this;
    return {
      researchTopic: controls
        ? [
            researchTopic,
            [Validators.required].concat(
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              )
            ),
          ]
        : researchTopic,
      motivesAndReasons: controls
        ? [
            motivesAndReasons,
            [Validators.required].concat(
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.EXPLANATIONS
              )
            ),
          ]
        : motivesAndReasons,
      researchAndStudyObjectives: controls
        ? [
            researchAndStudyObjectives,
            [Validators.required].concat(
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.EXPLANATIONS
              )
            ),
          ]
        : researchAndStudyObjectives,
      expectedResearchResults: controls
        ? [
            expectedResearchResults,
            [Validators.required].concat(
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.EXPLANATIONS
              )
            ),
          ]
        : expectedResearchResults,
      researcherDefinition: controls
        ? [
            researcherDefinition,
            [Validators.required].concat(
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.EXPLANATIONS
              )
            ),
          ]
        : researcherDefinition,
      generalLandmarks: controls
        ? [
            generalLandmarks,
            [Validators.required].concat(
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.EXPLANATIONS
              )
            ),
          ]
        : generalLandmarks,
      searchStartDate: controls
        ? [searchStartDate, [Validators.required]]
        : searchStartDate,
      searchSubmissionDeadline: controls
        ? [searchSubmissionDeadline, [Validators.required]]
        : searchSubmissionDeadline,
      requiredRole: controls
        ? [
            requiredRole,
            [Validators.required].concat(
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              )
            ),
          ]
        : requiredRole,
      financialCost: controls
        ? [
            financialCost,
            [Validators.required].concat(
              CustomValidators.decimal(
                CustomValidators.defaultLengths.DECIMAL_PLACES
              ),
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.NUMBERS_MAXLENGTH
              )
            ),
          ]
        : financialCost,
    };
  }
}
