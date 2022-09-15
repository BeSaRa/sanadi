import {IWFResponse} from '@contracts/i-w-f-response';
import {Observable} from 'rxjs';

export interface IGeneralAssociationMeetingProceedSendToMembers {
  proceedSendToMembers(taskId: string, info: Partial<IWFResponse>): Observable<boolean>;
}
