import { AdminResult } from "./admin-result";
import { FactoryService } from "@app/services/factory.service";
import { LangService } from "@app/services/lang.service";
import { SearchableCloneable } from "./searchable-cloneable";
import { Validators } from "@angular/forms";
import { CustomValidators } from "@app/validators/custom-validators";

export class EffectiveCoordinationCapabilities extends SearchableCloneable<EffectiveCoordinationCapabilities> {
  eventTopic!: string;
  motivesAndRationale!: string;
  eventObjectives!: string;
  expectedOutcomes!: string;
  axes!: string;
  eventStartDate!: string;
  daysNumber!: number;
  hoursNumber!: number;
  organizationWay!: number;
  sponsorsAndOrganizingPartners!: string;
  financialAllotment!: number;
  organizationRequiredRole!: string;
  organizationWayInfo!: AdminResult;
  langService?: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService("LangService");
  }
  get DisplayedColumns(): string[] {
    return [
      "eventTopic",
      "motivesAndRationale",
      "eventObjectives",
      "expectedOutcomes",
      "axes",
      "eventStartDate",
      "daysNumber",
      "hoursNumber",
      "organizationWay",
      "sponsorsAndOrganizingPartners",
      "financialAllotment",
      "organizationRequiredRole",
      "actions"
    ];
  }
  BuildForm(controls?: boolean) {
    const {
      eventTopic,
      motivesAndRationale,
      eventObjectives,
      expectedOutcomes,
      axes,
      eventStartDate,
      daysNumber,
      hoursNumber,
      organizationWay,
      sponsorsAndOrganizingPartners,
      financialAllotment,
      organizationRequiredRole,
    } = this;
    return {
      eventTopic: controls ? [eventTopic, [Validators.required]] : eventTopic,
      motivesAndRationale: controls
        ? [motivesAndRationale, [Validators.required]]
        : motivesAndRationale,
      eventObjectives: controls
        ? [eventObjectives, [Validators.required]]
        : eventObjectives,
      expectedOutcomes: controls
        ? [expectedOutcomes, [Validators.required]]
        : expectedOutcomes,
      axes: controls ? [axes, [Validators.required]] : axes,
      eventStartDate: controls
        ? [eventStartDate, [Validators.required]]
        : eventStartDate,
      daysNumber: controls ? [daysNumber, [Validators.required].concat(CustomValidators.number)] : daysNumber,
      hoursNumber: controls
        ? [hoursNumber, [Validators.required].concat(CustomValidators.number)]
        : hoursNumber,
      organizationWay: controls
        ? [organizationWay, [Validators.required]]
        : organizationWay,
      sponsorsAndOrganizingPartners: controls
        ? [sponsorsAndOrganizingPartners, [Validators.required]]
        : sponsorsAndOrganizingPartners,
      financialAllotment: controls
        ? [financialAllotment, [Validators.required].concat(CustomValidators.number)]
        : financialAllotment,
      organizationRequiredRole: controls
        ? [organizationRequiredRole, [Validators.required]]
        : organizationRequiredRole,
    };
  }
}
