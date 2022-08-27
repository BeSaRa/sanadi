import { CustomValidators } from './../validators/custom-validators';
import { Validators } from "@angular/forms";
import { FactoryService } from "@app/services/factory.service";
import { LangService } from "@app/services/lang.service";
import { SearchableCloneable } from "./searchable-cloneable";

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
    this.langService = FactoryService.getService("LangService");
  }

  get DisplayedColumns(): string[] {
    return [
      "researchTopic",
      "researchAndStudyObjectives",
      "expectedResearchResults",
      "generalLandmarks",
      "searchStartDate",
      "searchSubmissionDeadline",
      "requiredRole",
      "financialCost",
      "actions"
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
        ? [researchTopic, [Validators.required].concat(CustomValidators.minLength(3))]
        : researchTopic,
      motivesAndReasons: controls
        ? [motivesAndReasons, [Validators.required].concat(CustomValidators.minLength(5))]
        : motivesAndReasons,
      researchAndStudyObjectives: controls
        ? [researchAndStudyObjectives, [Validators.required]]
        : researchAndStudyObjectives,
      expectedResearchResults: controls
        ? [expectedResearchResults, [Validators.required].concat(CustomValidators.minLength(3))]
        : expectedResearchResults,
      generalLandmarks: controls
        ? [generalLandmarks, [Validators.required].concat(CustomValidators.minLength(5))]
        : generalLandmarks,
      searchStartDate: controls
        ? [searchStartDate, [Validators.required]]
        : searchStartDate,
      searchSubmissionDeadline: controls
        ? [searchSubmissionDeadline, [Validators.required]]
        : searchSubmissionDeadline,
      requiredRole: controls
        ? [requiredRole, [Validators.required]]
        : requiredRole,
      researcherDefinition: controls
        ? [researcherDefinition, [Validators.required].concat(CustomValidators.minLength(3))]
        : researcherDefinition,
      financialCost: controls
        ? [financialCost, [Validators.required].concat(CustomValidators.number)]
        : financialCost,
    };
  }
}
