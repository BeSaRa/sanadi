import {UntypedFormGroup} from '@angular/forms';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {GeneralAssociationExternalMember} from '@app/models/general-association-external-member';

export interface IGeneralAssociationMeetingAttendanceComplete {
  completeWithSave(form: UntypedFormGroup, administrativeBoardMembers: GeneralAssociationExternalMember[], generalAssociationMembers: GeneralAssociationExternalMember[], agendaItems: string[]): DialogRef;
  isMemberReviewStep(): boolean;
  memberCanNotComplete(): DialogRef;
}
