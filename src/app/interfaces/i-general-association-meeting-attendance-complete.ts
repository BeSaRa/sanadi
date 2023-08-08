import {UntypedFormGroup} from '@angular/forms';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {GeneralAssociationExternalMember} from '@app/models/general-association-external-member';
import { GeneralAssociationAgenda } from '@app/models/general-association-meeting-agenda';

export interface IGeneralAssociationMeetingAttendanceComplete {
  completeWithSave(form: UntypedFormGroup, administrativeBoardMembers: GeneralAssociationExternalMember[], generalAssociationMembers: GeneralAssociationExternalMember[], agendaItems: GeneralAssociationAgenda[]): DialogRef;
  isMemberReviewStep(): boolean;
  memberCanNotComplete(): DialogRef;
}
