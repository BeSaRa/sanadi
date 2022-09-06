import { AdminResult } from '@app/models/admin-result';
import { CustomValidators } from './../validators/custom-validators';
import { Validators } from '@angular/forms';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { SearchableCloneable } from './searchable-cloneable';

export class ResearchAndStudies extends SearchableCloneable<ResearchAndStudies> {
  researchTopic!: string;
  motivesAndReasons!: string;
  researchAndStudyObjectives!: string;
  expectedResearchResults!: string;
  generalLandmarks!: string;
  searchStartDate!: string;
  searchSubmissionDeadline!: string;
  requiredRole!: string;
  researcherDefinition!: string;
  financialCost!: number;
  langService?: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  get DisplayedColumns(): string[] {
    return [
      'researchTopic',
      'researchAndStudyObjectives',
      'expectedResearchResults',
      'generalLandmarks',
      'searchStartDate',
      'searchSubmissionDeadline',
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
                CustomValidators.defaultLengths.SWIFT_CODE_MAX
              )
            ),
          ]
        : financialCost,
    };
  }
}
