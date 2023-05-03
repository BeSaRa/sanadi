import {HttpClient} from '@angular/common/http';
import {ComponentFactoryResolver, Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {CastResponseContainer} from '@app/decorators/decorators/cast-response';
import {BaseGenericEService} from '@app/generics/base-generic-e-service';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {BlobModel} from '@app/models/blob-model';
import {CharityOrganizationUpdate} from '@app/models/charity-organization-update';
import {CharityOrganizationUpdateSearchCriteria} from '@app/models/charity-organization-update-search-criteria';
import {FinalExternalOfficeApprovalResult} from '@app/models/final-external-office-approval-result';
import {ExternalOfficesPopupComponent} from '@app/shared/components/external-offices-popup/external-offices-popup.component';
import {of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {DialogService} from './dialog.service';
import {DynamicOptionsService} from './dynamic-options.service';
import {FactoryService} from './factory.service';
import {FollowupDateService} from './follow-up-date.service';
import {UrlService} from './url.service';
import { CharityOrganization } from '@app/models/charity-organization';

@CastResponseContainer({
  $default: {
    model: () => CharityOrganizationUpdate,
    shape: {},
  },
})
@Injectable({
  providedIn: 'root',
})
export class CharityOrganizationUpdateService extends BaseGenericEService<CharityOrganizationUpdate> {


  jsonSearchFile: string = 'charity_update_request.json';
  serviceKey: keyof ILanguageKeys = 'menu_charity_organization_update';
  caseStatusIconMap: Map<number, string> = new Map();
  searchColumns: string[] = ['fullSerial', 'createdOn', 'caseStatus', 'subject', 'ouInfo'];
  charityOrganizations: CharityOrganization[] = [];

  constructor(
    // For complete the request with a follow up
    private _: FollowupDateService,
    public http: HttpClient,
    public cfr: ComponentFactoryResolver,
    public dynamicService: DynamicOptionsService,
    public domSanitizer: DomSanitizer,
    public dialog: DialogService,
    private urlService: UrlService,
  ) {
    super();
    FactoryService.registerService('CharityOrganizationUpdateService', this);
  }
  _getURLSegment(): string {
    return this._getUrlService().URLS.CHARITY_ORGANIZATION_UPDATE;
  }
  _getModel() {
    return CharityOrganizationUpdate;
  }
  getSearchCriteriaModel<S extends CharityOrganizationUpdate>(): CharityOrganizationUpdate {
    return new CharityOrganizationUpdateSearchCriteria();
  }
  getCaseComponentName(): string {
    return 'CharityOrganizationUpdateComponent';
  }
  _getUrlService(): UrlService {
    return this.urlService;
  }
  openExternalOfficePopup(office: FinalExternalOfficeApprovalResult) {
    return this.dialog.show(ExternalOfficesPopupComponent, office);
  }
  getLogo(id: string) {
    return this.http.get(this._getURLSegment() + `/document/${id}/download`, {
      responseType: 'blob',
      observe: 'body'
    }).pipe(
      map(blob => new BlobModel(blob, this.domSanitizer),
        catchError(_ => {
          return of(new BlobModel(new Blob([], { type: 'error' }), this.domSanitizer));
        })));
  }

  saveLogo(caseId: string, file: File) {
    const form = new FormData();
    form.append('content', file);
    form.append('itemId', caseId.toString());
    return this.http.post(this._getURLSegment() + '/' + caseId + '/logo', form).pipe(map((e: any) => e.rs.id));
  }
}
