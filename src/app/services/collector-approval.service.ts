import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { CollectorApproval } from '@app/models/collector-approval';
import { DialogService } from './dialog.service';
import { DynamicOptionsService } from './dynamic-options.service';
import { UrlService } from './url.service';
import { FactoryService } from '@app/services/factory.service';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { DialogRef } from '@app/shared/models/dialog-ref';
import {
  CollectorApprovalApproveTaskPopupComponent
} from '@app/modules/services/collector-approval/popups/collector-approval-approve-task-popup/collector-approval-approve-task-popup.component';
import { CollectorApprovalSearchCriteria } from '@app/models/collector-approval-search-criteria';
import { CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { BaseGenericEService } from "@app/generics/base-generic-e-service";

@CastResponseContainer({
  $default: {
    model: () => CollectorApproval
  }
})
@Injectable({
  providedIn: 'root'
})
export class CollectorApprovalService extends BaseGenericEService<CollectorApproval> {
  jsonSearchFile: string = 'collector_approval_form.json';
  serviceKey: keyof ILanguageKeys = 'menu_collector_approval';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = ['fullSerial', 'requestTypeInfo', 'subject', 'caseStatus', 'ouInfo', 'creatorInfo', 'createdOn'];

  constructor(
    public http: HttpClient,
    public dialog: DialogService,
    public domSanitizer: DomSanitizer,
    public dynamicService: DynamicOptionsService,
    public urlService: UrlService
  ) {
    super();
    FactoryService.registerService('CollectorApprovalService', this);
  }

  _getModel() {
    return CollectorApproval;
  }

  _getURLSegment(): string {
    return this.urlService.URLS.COLLECTOR_APPROVAL;
  }

  getSearchCriteriaModel<S extends CollectorApproval>(): CollectorApproval {
    return new CollectorApprovalSearchCriteria();
  }

  getCaseComponentName(): string {
    return 'CollectorApprovalComponent';
  }

  _getUrlService(): UrlService {
    return this.urlService;
  }

  approveTask(model: CollectorApproval, action: WFResponseType): DialogRef {
    return this.dialog.show(CollectorApprovalApproveTaskPopupComponent, {
      model,
      action: action
    });
  }
}
