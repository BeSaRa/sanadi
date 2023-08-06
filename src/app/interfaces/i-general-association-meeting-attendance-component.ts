import {FormControl, UntypedFormGroup} from '@angular/forms';
import {GeneralAssociationExternalMember} from '@app/models/general-association-external-member';
import {GeneralAssociationInternalMember} from '@app/models/general-association-internal-member';

export interface IGeneralAssociationMeetingAttendanceComponent {
  form: UntypedFormGroup;
  isValidPointsToSave: () => boolean;
  selectedAdministrativeBoardMembers: GeneralAssociationExternalMember[];
  selectedGeneralAssociationMembers: GeneralAssociationExternalMember[];
  selectedInternalUsers: GeneralAssociationInternalMember[];
  agendaItems: string[];
  meetingDate: FormControl;
  year: FormControl;
}
