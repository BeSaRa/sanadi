import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { CastResponseContainer } from "@app/decorators/decorators/cast-response";
import { WFResponseType } from "@app/enums/wfresponse-type.enum";
import { BaseGenericEService } from "@app/generics/base-generic-e-service";
import { ILanguageKeys } from "@app/interfaces/i-language-keys";
import { CollectionApprovalClone } from "@app/models/collection-approval-clone";
import { CollectionApprovalCloneSearchCriteria } from "@app/models/collection-approval-clone-search-criteria";
import { CollectionApprovalSearchCriteria } from "@app/models/collection-approval-search-criteria";
import { CollectionApprovalApproveTaskPopupComponent } from "@app/modules/collection/popups/collection-approval-approve-task-poup/collection-approval-approve-task-popup.component";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { DialogService } from "./dialog.service";
import { DynamicOptionsService } from "./dynamic-options.service";
import { FactoryService } from "./factory.service";
import { LangService } from "./lang.service";
import { UrlService } from "./url.service";

@CastResponseContainer({
    $default: { model: () => CollectionApprovalClone }
})
@Injectable({
    providedIn: 'root'
})
export class CollectionApprovalCloneService extends BaseGenericEService<CollectionApprovalClone> {
    _getURLSegment(): string {
        return this.urlService.URLS.COLLECTION_APPROVAL_CLONE
    }
    _getModel() {
        return CollectionApprovalClone;
    }
    getSearchCriteriaModel<S extends CollectionApprovalClone>(): CollectionApprovalClone {
        return new CollectionApprovalCloneSearchCriteria();
    }
    getCaseComponentName(): string {
        return 'CollectionApprovalClone';
    }

    jsonSearchFile: string = 'collection_approval_search_clone.json';
    serviceKey: keyof ILanguageKeys  = 'menu_collection_services_approval';
    caseStatusIconMap: Map<number, string> = new Map<number, string>();
    searchColumns: string[] = ['fullSerial', 'requestTypeInfo', 'subject', 'caseStatus', 'requestClassificationInfo', 'creatorInfo', 'ouInfo', 'createdOn'];

    _getUrlService(): UrlService {
        return this.urlService;
    }

    constructor(
        private urlService:UrlService,
        public http: HttpClient,
        public dialog:  DialogService,
        public domSanitizer: DomSanitizer,
        public lang: LangService,
        public dynamicService: DynamicOptionsService,
        ){
        super()
        FactoryService.registerService('CollectionApprovalCloneService', this);
    }
    approveTask(model: CollectionApprovalClone, action: WFResponseType): DialogRef {
        return this.dialog.show(CollectionApprovalApproveTaskPopupComponent, {
          model,
          action: action
        });
    }
}