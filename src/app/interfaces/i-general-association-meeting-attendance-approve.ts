import {DialogRef} from '@app/shared/models/dialog-ref';
import {GeneralAssociationInternalMember} from '@app/models/general-association-internal-member';

export interface IGeneralAssociationMeetingAttendanceApprove {
  approveWithSave(selectedInternalMembers: GeneralAssociationInternalMember[], meetingDate: Date, year: number): DialogRef;
  initialApproveWithSave(selectedInternalMembers: GeneralAssociationInternalMember[], meetingDate: Date, year: number): DialogRef;
}
