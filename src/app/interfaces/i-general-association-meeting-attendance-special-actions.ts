import {DialogRef} from '@app/shared/models/dialog-ref';
import {Observable} from 'rxjs';

export interface IGeneralAssociationMeetingAttendanceSpecialActions {
  sendToGeneralMeetingMembers(): DialogRef;
  proceedSendToMembers(taskId: string): Observable<boolean>;
}
