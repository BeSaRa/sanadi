import { GeneralAssociationAgenda } from '@models/general-association-meeting-agenda';
import {FormControl, UntypedFormGroup} from '@angular/forms';
import {GeneralAssociationExternalMember} from '@app/models/general-association-external-member';
import {GeneralAssociationInternalMember} from '@app/models/general-association-internal-member';

export interface IGeneralAssociationMeetingAttendanceComponent {
  form: UntypedFormGroup;
  meetingPointsForm: UntypedFormGroup;
  selectedAdministrativeBoardMembers: GeneralAssociationExternalMember[];
  selectedGeneralAssociationMembers: GeneralAssociationExternalMember[];
  selectedInternalUsers: GeneralAssociationInternalMember[];
  agendaItems: GeneralAssociationAgenda[];
  meetingDate: FormControl;
  year: FormControl;
}
