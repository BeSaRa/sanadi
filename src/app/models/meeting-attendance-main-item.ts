import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { AuditOperationTypes } from './../enums/audit-operation-types';
import { CommonUtils } from './../helpers/common-utils';
import { ControlValueLabelLangKey, ISearchFieldsMap } from './../types/types';
import { CustomValidators } from './../validators/custom-validators';
import { ObjectUtils } from './../helpers/object-utils';
import { AdminResult } from './admin-result';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { MeetingAttendanceSubItem } from '@app/models/meeting-attendance-sub-item';

export class MeetingAttendanceMainItem extends SearchableCloneable<MeetingAttendanceMainItem>{
  id!: number;
  enName!: string;
  caseID!: string;
  meetingSubItem!: MeetingAttendanceSubItem[];
  decisionMakerID!: number;
  memberID!: number;
  addedByDecisionMaker!: boolean;
  status!: number;
  finalItem!: number;

  // extra properties
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  searchFields: ISearchFieldsMap<MeetingAttendanceMainItem> = {
    ...normalSearchFields(['enName']),
  };

  constructor() {
    super();
  }

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      enName: { langKey: 'english_name', value: this.enName }
    };
  }

  getFields(control: boolean = false): any {
    const values = ObjectUtils.getControlValues<MeetingAttendanceMainItem>(this.getValuesWithLabels());
    return {
      enName: control ? [values.enName, [
        CustomValidators.required, CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH
        )]] : values.enName,
    };
  }

  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof MeetingAttendanceMainItem): AdminResult {
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

  isEqual(record: MeetingAttendanceMainItem): boolean {
    return this.enName === record.enName
  }
}
