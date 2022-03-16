import {HttpClient} from '@angular/common/http';
import {ComponentFactoryResolver, Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {EServiceGenericService} from "@app/generics/e-service-generic-service";
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {CollectionApproval} from "@app/models/collection-approval";
import {DialogService} from './dialog.service';
import {DynamicOptionsService} from './dynamic-options.service';
import {UrlService} from './url.service';
import {CollectionApprovalInterceptor} from "@app/model-interceptors/collection-approval-interceptor";
import {FactoryService} from "@app/services/factory.service";
import {LangService} from "@app/services/lang.service";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {
  CollectionApprovalApproveTaskPopupComponent
} from "@app/modules/collection/popups/collection-approval-approve-task-poup/collection-approval-approve-task-popup.component";
import {WFResponseType} from "@app/enums/wfresponse-type.enum";
import {CollectionApprovalSearchCriteria} from "@app/models/collection-approval-search-criteria";

@Injectable({
  providedIn: 'root'
})
export class CollectionApprovalService extends EServiceGenericService<CollectionApproval> {
  jsonSearchFile: string = 'collection_approval_search.json';
  interceptor: IModelInterceptor<CollectionApproval> = new CollectionApprovalInterceptor();
  serviceKey: keyof ILanguageKeys = 'menu_collection_services_approval';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = [];

  _getModel() {
    return CollectionApproval;
  }

  _getURLSegment(): string {
    return this.urlService.URLS.COLLECTION_APPROVAL;
  }

  _getInterceptor(): Partial<IModelInterceptor<CollectionApproval>> {
    return this.interceptor;
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
              public cfr: ComponentFactoryResolver,
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
