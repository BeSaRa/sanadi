import { GeneralProcessNotificationApprovalComponent } from './../modules/general-services/popups/general-process-notification-approval/general-process-notification-approval.component';
import { DialogRef } from './../shared/models/dialog-ref';
import { WFResponseType } from './../enums/wfresponse-type.enum';
import { Observable } from 'rxjs';
import { LicenseService } from './license.service';
import { FactoryService } from './factory.service';
import { UrlService } from '@services/url.service';
import { GeneralProcessNotification } from '@app/models/general-process-notification';
import { BaseGenericEService } from '@app/generics/base-generic-e-service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { DialogService } from './dialog.service';
import { DynamicOptionsService } from './dynamic-options.service';

@Injectable({
  providedIn: 'root'
})
export class GeneralProcessNotificationService extends BaseGenericEService<GeneralProcessNotification> {
  jsonSearchFile: string = 'general_process_notification_search.json';
  serviceKey: keyof ILanguageKeys = 'menu_general_process_notification';
  caseStatusIconMap: Map<number, string> = new Map();
  searchColumns: string[] = ['fullSerial', 'createdOn', 'caseStatus', 'subject', 'creatorInfo'];
  selectLicenseDisplayColumns: string[] = ['enName', 'licenseNumber', 'status', 'actions'];

  constructor(
    public http: HttpClient,
    public dialog: DialogService,
    private UrlService: UrlService,
    public dynamicService: DynamicOptionsService,
    private licenseService: LicenseService,
    public domSanitizer: DomSanitizer) {
    super();
    FactoryService.registerService('GeneralProcessNotificationService', this);
  }
  _getURLSegment(): string {
    return this._getUrlService().URLS.GENERAL_PROCESS_NOTIFICATION;
  }
  _getModel() {
    return GeneralProcessNotification;
  }
  getSearchCriteriaModel<S extends GeneralProcessNotification>(): GeneralProcessNotification {
    return new GeneralProcessNotification();
  }
  getCaseComponentName(): string {
    return 'GeneralProcessNotificationComponent';
  }
  _getUrlService(): UrlService {
    return this.UrlService;
  }
  licenseSearch(criteria: Partial<GeneralProcessNotification> = {}): Observable<GeneralProcessNotification[]> {
    return this.licenseService.GeneralProcessNotificationSearch(criteria);
  }
  approve(model: GeneralProcessNotification, action: WFResponseType): DialogRef {
    return this.dialog.show(GeneralProcessNotificationApprovalComponent, {
      model,
      action
    });
  }
}
