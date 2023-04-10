import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { CollectionApproval } from "@app/models/collection-approval";
import { DialogService } from './dialog.service';
import { DynamicOptionsService } from './dynamic-options.service';
import { UrlService } from './url.service';
import { FactoryService } from "@app/services/factory.service";
import { LangService } from "@app/services/lang.service";
import { DialogRef } from "@app/shared/models/dialog-ref";
import {
  CollectionApprovalApproveTaskPopupComponent
} from "@app/modules/services/collection-approval/popups/collection-approval-approve-task-poup/collection-approval-approve-task-popup.component";
import { WFResponseType } from "@app/enums/wfresponse-type.enum";
import { CollectionApprovalSearchCriteria } from "@app/models/collection-approval-search-criteria";
import { BaseGenericEService } from "@app/generics/base-generic-e-service";
import { CastResponseContainer } from "@decorators/cast-response";

@CastResponseContainer({
  $default: { model: () => CollectionApproval }
})
@Injectable({
  providedIn: 'root'
})
export class CollectionApprovalService extends BaseGenericEService<CollectionApproval> {
  jsonSearchFile: string = 'collection_approval_search.json';
  serviceKey: keyof ILanguageKeys = 'menu_collection_services_approval';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = ['fullSerial', 'requestTypeInfo', 'subject', 'caseStatus', 'requestClassificationInfo', 'creatorInfo', 'ouInfo', 'createdOn'];

  _getModel() {
    return CollectionApproval;
  }

  _getURLSegment(): string {
    return this.urlService.URLS.COLLECTION_APPROVAL;
  }

  getSearchCriteriaModel<S extends CollectionApproval>(): CollectionApproval {
    return new CollectionApprovalSearchCriteria();
  }

  getCaseComponentName(): string {
    return 'CollectionApprovalComponent';
  }

  _getUrlService(): UrlService {
    return this.urlService;
  }

  constructor(public domSanitizer: DomSanitizer,
              public lang: LangService,
              public http: HttpClient,
              public dynamicService: DynamicOptionsService,
              private urlService: UrlService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('CollectionApprovalService', this);
  }

  approveTask(model: CollectionApproval, action: WFResponseType): DialogRef {
    return this.dialog.show(CollectionApprovalApproveTaskPopupComponent, {
      model,
      action: action
    });
  }
}
