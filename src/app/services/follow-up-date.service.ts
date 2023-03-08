import {Injectable} from '@angular/core';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {
  FollowupDateApprovePopupComponent
} from '@app/modules/services/charity-organization-update/popups/follow-up-date-approve-popup/follow-up-date-approve-popup.component';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {FollowUpDateModels} from '@app/types/types';
import {DialogService} from './dialog.service';
import {FactoryService} from './factory.service';

@Injectable({
  providedIn: 'root',
})
export class FollowupDateService {

  constructor(private dialog: DialogService) {
    FactoryService.registerService('FollowupDateService', this);
  }

  public finalApproveTask(model: FollowUpDateModels, action: WFResponseType): DialogRef {
    return this.dialog.show(FollowupDateApprovePopupComponent, {
      model,
      action
    });
  }
}
