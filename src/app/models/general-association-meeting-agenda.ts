import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {CommonUtils} from '@app/helpers/common-utils';
import {IAuditModelProperties} from '@app/interfaces/i-audit-model-properties';
import {AdminResult} from '@app/models/admin-result';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from "@helpers/normal-search-fields";
import {ObjectUtils} from "@helpers/object-utils";
import {CustomValidators} from "@app/validators/custom-validators";

export class GeneralAssociationAgenda extends SearchableCloneable<GeneralAssociationAgenda> implements IAuditModelProperties<GeneralAssociationAgenda> {
  agenda!: string;
  itemId!: string;

  // extra properties
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  searchFields: ISearchFieldsMap<GeneralAssociationAgenda> = {
    ...normalSearchFields(['agenda'])
  }

  constructor() {
    super();
  }

  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof GeneralAssociationAgenda): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {

      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({arName: value as string, enName: value as string});
    }
    return adminResultValue ?? new AdminResult();
  }

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      agenda: {langKey: 'meeting_agenda', value: this.agenda},
    };
  }

  buildForm(control: boolean = false): any {
    const values = ObjectUtils.getControlValues<GeneralAssociationAgenda>(this.getValuesWithLabels());
    return {
      agenda: control ? [values.agenda, [CustomValidators.required,
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX)]
      ] : values.agenda
    }
  }

  isEqual(record: GeneralAssociationAgenda): boolean {
    return this.agenda === record.agenda;
  }
}
