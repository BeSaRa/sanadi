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
  jsonSearchFile: string = '';
  serviceKey: keyof ILanguageKeys = 'menu_general_process_notification';
  caseStatusIconMap: Map<number, string> = new Map();
  searchColumns: string[] = ['fullSerial', 'createdOn', 'creatorInfo', 'caseStatus', 'subject', 'ouInfo'];
  // selectLicenseDisplayColumns: string[] = ['enName', 'licenseNumber', 'status', 'actions'];

  constructor(
    public http: HttpClient,
    public dialog: DialogService,
    private UrlService: UrlService,
    public dynamicService: DynamicOptionsService,
    public domSanitizer: DomSanitizer) {
    super();
    FactoryService.registerService('GeneralProcessNotificationService', this);
  }
  _getURLSegment(): string {
    return this._getUrlService().URLS.GENERAL_PROCESS_NOTIFICATION;
  }
  _getModel() {
    return new GeneralProcessNotification();
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
}
