import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { ObjectUtils } from "@app/helpers/object-utils";
import { ControlValueLabelLangKey, ISearchFieldsMap } from "@app/types/types";
import { CustomValidators } from "@app/validators/custom-validators";
import { InternalUser } from "./internal-user";
import { SearchableCloneable } from "./searchable-cloneable";
import { ActualInspection } from "./actual-inspection";
import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { inspectionSpecialistInterceptor } from "@app/model-interceptors/inspection-specialist-interceptor";

const {send,receive} = new inspectionSpecialistInterceptor()
@InterceptModel({send,receive})
export class InspectionSpecialist extends SearchableCloneable<InspectionSpecialist>{
  id!:number
  externalSpecialistName!: string;
  externalSpecialistAdjective!: string;
  externalSpecialistEntity!: string;
  externalSpecialistPhone!: string;
  externalSpecialistOther!: string;
  internalSpecialist!:InternalUser;

  actualInspection?:ActualInspection

  searchFields: ISearchFieldsMap<InspectionSpecialist> = {
    ...normalSearchFields(['externalSpecialistName', 'externalSpecialistEntity', 'externalSpecialistAdjective'])
  }
  getFormValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      externalSpecialistName: { langKey: 'lbl_external_specialist_name', value: this.externalSpecialistName },
      externalSpecialistAdjective: { langKey: 'lbl_external_specialist_adjective', value: this.externalSpecialistAdjective },
      externalSpecialistEntity: { langKey: 'lbl_external_specialist_entity', value: this.externalSpecialistEntity },
      externalSpecialistPhone: { langKey: 'lbl_external_specialist_phone', value: this.externalSpecialistPhone },
      externalSpecialistOther: { langKey: 'lbl_other_data', value: this.externalSpecialistOther },

    };
  }
  buildForm(controls: boolean = false): any {
    const values = ObjectUtils.getControlValues<InspectionSpecialist>(
      this.getFormValuesWithLabels()
    );
    return {
      externalSpecialistName : controls ? [values.externalSpecialistName,[CustomValidators.required,CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : values.externalSpecialistName,
      externalSpecialistAdjective : controls ? [values.externalSpecialistAdjective,[CustomValidators.required,CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : values.externalSpecialistAdjective,
      externalSpecialistEntity : controls ? [values.externalSpecialistEntity,[CustomValidators.required,CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : values.externalSpecialistEntity,
      externalSpecialistPhone : controls ? [values.externalSpecialistPhone,[CustomValidators.pattern('PHONE_NUMBER')]] : values.externalSpecialistPhone,
      externalSpecialistOther : controls ? [values.externalSpecialistOther,[CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.externalSpecialistOther,
    }
  }
}
