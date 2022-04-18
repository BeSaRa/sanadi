import {HttpClient} from '@angular/common/http';
import {ComponentFactoryResolver, Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {EServiceGenericService} from '@app/generics/e-service-generic-service';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {CollectorApproval} from '@app/models/collector-approval';
import {DialogService} from './dialog.service';
import {DynamicOptionsService} from './dynamic-options.service';
import {UrlService} from './url.service';
import {CollectorApprovalInterceptor} from '@app/model-interceptors/collector-approval-interceptor';
import {FactoryService} from '@app/services/factory.service';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {
  CollectorApprovalApproveTaskPopupComponent
} from '@app/modules/collection/popups/collector-approval-approve-task-popup/collector-approval-approve-task-popup.component';
import {CollectorApprovalSearchCriteria} from '@app/models/collector-approval-search-criteria';

@Injectable({
  providedIn: 'root'
})
export class CollectorApprovalService extends EServiceGenericService<CollectorApproval> {
  jsonSearchFile: string = 'collector_approval_form.json';
  interceptor: IModelInterceptor<CollectorApproval> = new CollectorApprovalInterceptor();
  serviceKey: keyof ILanguageKeys = 'menu_collector_approval';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = ['fullSerial', 'subject', 'caseStatus', 'ouInfo', 'creatorInfo', 'createdOn'];

  constructor(
    public http: HttpClient,
    public dialog: DialogService,
    public domSanitizer: DomSanitizer,
    public cfr: ComponentFactoryResolver,
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

  _getInterceptor(): Partial<IModelInterceptor<CollectorApproval>> {
    return this.interceptor;
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
