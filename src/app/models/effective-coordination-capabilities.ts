import { AdminResult } from './admin-result';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { SearchableCloneable } from './searchable-cloneable';
import { Validators } from '@angular/forms';
import { CustomValidators } from '@app/validators/custom-validators';

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
    this.langService = FactoryService.getService('LangService');
  }
  get DisplayedColumns(): string[] {
    return [
      'eventTopic',
      'motivesAndRationale',
      'eventObjectives',
      'expectedOutcomes',
      'axes',
      'eventStartDate',
      'daysNumber',
      'hoursNumber',
      'organizationWay',
      'sponsorsAndOrganizingPartners',
      'financialAllotment',
      'organizationRequiredRole',
      'actions',
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
      eventTopic: controls
        ? [
            eventTopic,
            [Validators.required].concat(
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              )
            ),
          ]
        : eventTopic,
      motivesAndRationale: controls
        ? [
            motivesAndRationale,
            [Validators.required].concat(
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              )
            ),
          ]
        : motivesAndRationale,
      eventObjectives: controls
        ? [
            eventObjectives,
            [Validators.required].concat(
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              )
            ),
          ]
        : eventObjectives,
      expectedOutcomes: controls
        ? [
            expectedOutcomes,
            [Validators.required].concat(
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              )
            ),
          ]
        : expectedOutcomes,
      axes: controls
        ? [
            axes,
            [Validators.required].concat(
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              )
            ),
          ]
        : axes,
      eventStartDate: controls
        ? [eventStartDate, [Validators.required]]
        : eventStartDate,
      daysNumber: controls
        ? [
            daysNumber,
            [Validators.required].concat(
              CustomValidators.number,
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.SWIFT_CODE_MAX
              )
            ),
          ]
        : daysNumber,
      hoursNumber: controls
        ? [
            hoursNumber,
            [Validators.required].concat(
              CustomValidators.number,
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.SWIFT_CODE_MAX
              )
            ),
          ]
        : hoursNumber,
      organizationWay: controls
        ? [organizationWay, [Validators.required]]
        : organizationWay,
      sponsorsAndOrganizingPartners: controls
        ? [
            sponsorsAndOrganizingPartners,
            [Validators.required].concat(
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              )
            ),
          ]
        : sponsorsAndOrganizingPartners,
      financialAllotment: controls
        ? [
            financialAllotment,
            [Validators.required].concat(
              CustomValidators.decimal(
                CustomValidators.defaultLengths.DECIMAL_PLACES
              ),
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.SWIFT_CODE_MAX
              )
            ),
          ]
        : financialAllotment,
      organizationRequiredRole: controls
        ? [
            organizationRequiredRole,
            [Validators.required].concat(
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              )
            ),
          ]
        : organizationRequiredRole,
    };
  }
}
