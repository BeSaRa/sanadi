import { Validators } from '@angular/forms';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { EmployeeService } from '@app/services/employee.service';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey, ISearchFieldsMap } from '@app/types/types';
import { IMyDateModel } from 'angular-mydatepicker';
import { ResearchAndStudiesInterceptor } from './../model-interceptors/research-and-studies-interceptor';
import { CustomValidators } from './../validators/custom-validators';
import { SearchableCloneable } from './searchable-cloneable';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { DateUtils } from '@app/helpers/date-utils';
import { AdminResult } from './admin-result';

const { send, receive } = new ResearchAndStudiesInterceptor();

@InterceptModel({ send, receive })
export class ResearchAndStudies extends SearchableCloneable<ResearchAndStudies> implements IAuditModelProperties<ResearchAndStudies> {
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

  searchStartDateStamp!:number|null;
  searchSubmissionDeadlineStamp!:number|null;
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
  getAdminResultByProperty(property: keyof ResearchAndStudies): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'searchStartDate':
        const searchStartDateValue = DateUtils.getDateStringFromDate(this.searchStartDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({arName: searchStartDateValue, enName: searchStartDateValue});
        break;
      case 'searchSubmissionDeadline':
        const searchSubmissionDeadlineValue = DateUtils.getDateStringFromDate(this.searchSubmissionDeadline, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({arName: searchSubmissionDeadlineValue, enName: searchSubmissionDeadlineValue});
        break;
      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({ arName: value as string, enName: value as string });
    }
    return adminResultValue ?? new AdminResult();
  }
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      researchTopic:{ langKey: 'lbl_research_topic', value: this.researchTopic },
      motivesAndReasons:{ langKey: 'lbl_motives_and_reasons', value: this.motivesAndReasons },
      researchAndStudyObjectives:{ langKey: 'lbl_research_and_study_objectives', value: this.researchAndStudyObjectives },
      expectedResearchResults:{ langKey: 'lbl_expected_research_results', value: this.expectedResearchResults },
      generalLandmarks:{ langKey: 'lbl_general_landmarks', value: this.generalLandmarks },
      searchStartDate:{ langKey: 'lbl_search_start_date', value: this.searchStartDate,comparisonValue: this.searchStartDateStamp },
      searchSubmissionDeadline:{ langKey: 'lbl_search_submission_deadline', value: this.searchSubmissionDeadline,comparisonValue: this.searchSubmissionDeadlineStamp },
      requiredRole:{ langKey: 'lbl_required_role', value: this.requiredRole },
      researcherDefinition:{ langKey: 'lbl_researcher_definition', value: this.researcherDefinition },
      financialCost:{ langKey: 'lbl_financial_cost', value: this.financialCost },
     };
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
