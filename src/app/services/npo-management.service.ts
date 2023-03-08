import { NpoManagementApprovePopupComponent } from '../modules/services/npo-management/popups/npo-management-approve-popup/npo-management-approve-popup.component';
import { DialogRef } from './../shared/models/dialog-ref';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { FactoryService } from './factory.service';
import { NpoManagement } from './../models/npo-management';
import { BaseGenericEService } from '@app/generics/base-generic-e-service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { DialogService } from './dialog.service';
import { DynamicOptionsService } from './dynamic-options.service';
import { UrlService } from './url.service';
import { SearchNpoManagementCriteria } from '@app/models/search-npo-management-criteria';
import { CastResponseContainer } from '@app/decorators/decorators/cast-response';

@CastResponseContainer({
  $default: {
    model: () => NpoManagement
  }
})
@Injectable({
  providedIn: 'root'
})
export class NpoManagementService extends BaseGenericEService<NpoManagement> {

  jsonSearchFile: string = 'npo_manamement_search.json';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = ['fullSerial', 'createdOn', 'creatorInfo', 'caseStatus', 'subject', 'ouInfo'];
  serviceKey: keyof ILanguageKeys = 'menu_npo_management';

  constructor(
    private urlService: UrlService,
    public domSanitizer: DomSanitizer,
    public dialog: DialogService,
    public dynamicService: DynamicOptionsService,
    public http: HttpClient
  ) {
    super()
    FactoryService.registerService('NpoManagementService', this);
  }
  _getUrlService(): UrlService {
    return this.urlService;
  }
  _getURLSegment(): string {
    return this.urlService.URLS.NPO_MANAGEMENT;
  }
  _getModel() {
    return NpoManagement;
  }
  getSearchCriteriaModel<S extends NpoManagement>(): NpoManagement {
    return new SearchNpoManagementCriteria();
  }
  getCaseComponentName(): string {
    return 'NpoManagementComponent';
  }
  approve(model: NpoManagement, action: WFResponseType): DialogRef {
    return this.dialog.show(NpoManagementApprovePopupComponent, {
      model,
      action
    });
  }
}
