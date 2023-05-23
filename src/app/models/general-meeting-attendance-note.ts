import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {InterceptModel} from '@decorators/intercept-model';
import {
  GeneralMeetingAttendanceNoteInterceptor
} from '@app/model-interceptors/general-meeting-attendance-note-interceptor';
import {ObjectUtils} from "@helpers/object-utils";
import {CustomValidators} from "@app/validators/custom-validators";
import {ControlValueLabelLangKey, ISearchFieldsMap} from "@app/types/types";
import {ILanguageKeys} from "@contracts/i-language-keys";
import {normalSearchFields} from "@helpers/normal-search-fields";

const interceptor = new GeneralMeetingAttendanceNoteInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})

export class GeneralMeetingAttendanceNote extends SearchableCloneable<GeneralMeetingAttendanceNote> {
  id!: number;
  comment!: string;
  caseID!: string;
  memberID!: number;
  finalComment!: number;

  searchFields: ISearchFieldsMap<GeneralMeetingAttendanceNote> = {
    ...normalSearchFields(['comment'])
  }

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      id: {langKey: {} as keyof ILanguageKeys, value: this.id, skipAuditComparison: true},
      caseID: {langKey: {} as keyof ILanguageKeys, value: this.caseID, skipAuditComparison: true},
      memberID: {langKey: {} as keyof ILanguageKeys, value: this.memberID, skipAuditComparison: true},
      comment: {langKey: 'lbl_description', value: this.comment},
    };
  }

  buildForm(controls: boolean = false): any {
    const values = ObjectUtils.getControlValues<GeneralMeetingAttendanceNote>(this.getValuesWithLabels());
    return {
      id: controls ? [values.id] : values.id,
      caseID: controls ? [values.caseID] : values.caseID,
      memberID: controls ? [values.memberID] : values.memberID,
      comment: controls ? [values.comment, [CustomValidators.required,
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX)]] : values.comment
    }
  }
}
