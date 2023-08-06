import { CommonUtils } from './../helpers/common-utils';
import { AdminResult } from './admin-result';
import { AuditOperationTypes } from './../enums/audit-operation-types';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { ObjectUtils } from './../helpers/object-utils';
import { ControlValueLabelLangKey, ISearchFieldsMap } from './../types/types';
import { CustomValidators } from './../validators/custom-validators';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { MeetingPointMemberComment } from '@app/models/meeting-point-member-comment';

export class MeetingAttendanceSubItem extends SearchableCloneable<MeetingAttendanceSubItem>{
  id!:number;
  enName!: string;
  comment!: string;
  respectTerms?: boolean | number;
  userComments?: MeetingPointMemberComment[];
  mainItemID!: number;
  memberID!: number;
  addedByDecisionMaker!: boolean;
  status!: number;
  selected?: boolean;
  finalItem!: number;

  // extra properties
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  searchFields: ISearchFieldsMap<MeetingAttendanceSubItem> = {
    ...normalSearchFields(['enName']),
  };

  constructor() {
    super();
  }

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      enName: { langKey: 'english_name', value: this.enName },
      comment: { langKey: 'notes', value: this.comment },
      respectTerms: { langKey: 'respect_terms', value: this.respectTerms }
    };
  }

  getFields(control: boolean = false): any {
    const values = ObjectUtils.getControlValues<MeetingAttendanceSubItem>(this.getValuesWithLabels());
    return {
      enName: control ? [values.enName, [
        CustomValidators.required, CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)
      ]] : values.enName,
      comment: control ? [values.comment, [CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : values.comment,
      respectTerms: control ? [values.respectTerms, []] : values.respectTerms
    };
  }

  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof MeetingAttendanceSubItem): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {

      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({ arName: value as string, enName: value as string });
    }
    return adminResultValue ?? new AdminResult();
  }

  isEqual(record: MeetingAttendanceSubItem): boolean {
    return this.enName === record.enName
  }
}
