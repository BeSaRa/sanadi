import { HttpClient } from '@angular/common/http';
import { ComponentFactoryResolver, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CastResponse, CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { BaseGenericEService } from '@app/generics/base-generic-e-service';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { BlobModel } from '@app/models/blob-model';
import { CharityOrganizationUpdate } from '@app/models/charity-organization-update';
import { CharityOrganizationUpdateSearchCriteria } from '@app/models/charity-organization-update-search-criteria';
import { FinalExternalOfficeApprovalResult } from '@app/models/final-external-office-approval-result';
import { ExternalOfficesPopupComponent } from '@app/shared/popups/external-offices-popup/external-offices-popup.component';
import { of, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DialogService } from './dialog.service';
import { DynamicOptionsService } from './dynamic-options.service';
import { FactoryService } from './factory.service';
import { FollowupDateService } from './follow-up-date.service';
import { UrlService } from './url.service';
import { CharityOrganization } from '@app/models/charity-organization';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { OrgMember } from '@app/models/org-member';
import { SelectMemberPopupComponent } from '@app/modules/services/shared-services/popups/select-member-popup-component/select-member-popup.component';
import { NpoEmployee } from '@app/models/npo-employee';
import { HasInterception } from '@app/decorators/decorators/intercept-model';
import { CommonUtils } from '@app/helpers/common-utils';

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
  loadLogoByCaseId(id: string) {
    return this.http.post(this._getURLSegment() + `/${id}/logo/content`, {}, {
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
  openSelectMemberDialog(members: OrgMember[], select = true, isInternalMembers: boolean, displayedColumns: string[] = []): DialogRef {
    return this.dialog.show(SelectMemberPopupComponent, {
      members,
      select,
      isInternalMembers,
      displayedColumns
    });
  }

  getSearchNPOEmployeeCriteriaSegment(criteria: { arabicName?: string, englishName?: string, qId?: string, jobTitleName?: string }) {
    let criteriaSegment = '';

    if (CommonUtils.isValidValue(criteria.qId)) {
      criteriaSegment += ('q-id=' + criteria.qId);
    }

    if (CommonUtils.isValidValue(criteria.arabicName)) {
      if (criteriaSegment !== '') {
        criteriaSegment += '&';
      }
      criteriaSegment += ('arabic-name=' + criteria.arabicName);
    }

    if (CommonUtils.isValidValue(criteria.englishName)) {
      if (criteriaSegment !== '') {
        criteriaSegment += '&';
      }
      criteriaSegment += ('english-name=' + criteria.englishName);
    }

    if (CommonUtils.isValidValue(criteria.jobTitleName)) {
      if (criteriaSegment !== '') {
        criteriaSegment += '&';
      }
      criteriaSegment += ('job-title-name=' + criteria.jobTitleName);
    }

    return criteriaSegment;
  }
  getNpoEmployeeURLSegment(): string {
    return this.urlService.URLS.NPO_EMPLOYEE;
  }
  @HasInterception
  @CastResponse(() => NpoEmployee, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _searchNpoEmployees(criteria: { arabicName?: string, englishName?: string, qId?: string, jobTitleName?: string }): Observable<NpoEmployee[]> {
    let criteriaSegment = this.getSearchNPOEmployeeCriteriaSegment(criteria);

    return this.http.get<NpoEmployee[]>(this.getNpoEmployeeURLSegment() + '/search/criteria?' + criteriaSegment);
  }

  searchNpoEmployees(criteria: { arabicName?: string, englishName?: string, qId?: string, jobTitleName?: string }): Observable<NpoEmployee[]> {
    return this._searchNpoEmployees(criteria);
  }
}
