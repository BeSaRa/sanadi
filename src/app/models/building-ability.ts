import { Validators } from "@angular/forms";
import { AdminResult } from "@app/models/admin-result";
import { CustomValidators } from "@app/validators/custom-validators";
import { SearchableCloneable } from "./searchable-cloneable";

export class BuildingAbility extends SearchableCloneable<BuildingAbility> {
  activityName!: string;
  trainingActivityType!: number;
  activityGoal!: string;
  trainingActivityMainAxes!: string;
  trainingLanguage!: number;
  otherLanguage!: string;
  targetGroupNature!: string;
  participantsMaximumNumber!: number;
  suggestedActivityDateFrom!: string;
  suggestedActivityDateTo!: string;
  timeFrom!: string;
  timeTo!: string;
  trainingWay!: number;
  platform!: string;
  buildingsName!: string;
  floorNo!: string;
  hallName!: string;
  streetName!: string;
  filtrationMethod!: string;
  email!: string;
  otherFiltrationMethod!: string;
  trainingActivityTypeInfo!: AdminResult;
  trainingLanguageInfo!: AdminResult;
  trainingWayInfo!: AdminResult;

  constructor() {
    super();
  }

  formBuilder(controls?: boolean) {
    const {
      activityName,
      trainingActivityType,
      activityGoal,
      trainingActivityMainAxes,
      trainingLanguage,
      otherLanguage,
      targetGroupNature,
      participantsMaximumNumber,
      suggestedActivityDateFrom,
      suggestedActivityDateTo,
      timeFrom,
      timeTo,
      trainingWay,
      platform,
      buildingsName,
      floorNo,
      hallName,
      streetName,
      filtrationMethod,
      email,
      otherFiltrationMethod,
    } = this;
    return {
      activityName: controls
        ? [
            activityName,
            [Validators.required].concat(
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
              CustomValidators.minLength(
                CustomValidators.defaultLengths.MIN_LENGTH
              )
            ),
          ]
        : activityName,
      trainingActivityType: controls
        ? [trainingActivityType, Validators.required]
        : trainingActivityType,
      activityGoal: controls
        ? [activityGoal, Validators.required]
        : activityGoal,
      trainingActivityMainAxes: controls
        ? [trainingActivityMainAxes, Validators.required]
        : trainingActivityMainAxes,
      trainingLanguage: controls
        ? [trainingLanguage, Validators.required]
        : trainingLanguage,
      otherLanguage: controls ? [otherLanguage] : otherLanguage,
      targetGroupNature: controls
        ? [targetGroupNature, Validators.required]
        : targetGroupNature,
      participantsMaximumNumber: controls
        ? [
            participantsMaximumNumber,
            [Validators.required].concat(CustomValidators.number),
          ]
        : participantsMaximumNumber,
      suggestedActivityDateFrom: controls
        ? [suggestedActivityDateFrom, Validators.required]
        : suggestedActivityDateFrom,
      suggestedActivityDateTo: controls
        ? [suggestedActivityDateTo, Validators.required]
        : suggestedActivityDateTo,
      timeFrom: controls ? [timeFrom, Validators.required] : timeFrom,
      timeTo: controls ? [timeTo, Validators.required]:timeTo,
      trainingWay: controls ? [trainingWay, Validators.required] : trainingWay,
      platform: controls ? [platform] : platform,
      buildingsName: controls ? [buildingsName] : buildingsName,
      floorNo: controls ? [floorNo] : floorNo,
      hallName: controls ? [hallName] : hallName,
      streetName: controls ? [streetName] : streetName,
      filtrationMethod: controls
        ? [filtrationMethod, Validators.required]
        : filtrationMethod,
      email: controls
        ? [email, [Validators.email].concat(CustomValidators.maxLength(50))]
        : email,
      otherFiltrationMethod: controls
        ? [otherFiltrationMethod]
        : otherFiltrationMethod,
    };
  }
  get DisplayedColumns(): string[] {
    return [
      "activityName",
      "trainingActivityType",
      "activityGoal",
      "trainingActivityMainAxes",
      "trainingLanguage",
      "targetGroupNature",
      "participantsMaximumNumber",
      "suggestedActivityDateFrom",
      "suggestedActivityDateTo",
      "timeFrom",
      "timeTo",
      "trainingWay",
      "filtrationMethod",
      "actions",
    ];
  }
 
}
