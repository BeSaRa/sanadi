import {Observable} from 'rxjs';
import {LicenseService} from '@app/services/license.service';
import {
  AwarenessActivitySuggestionApprovalPopupComponent
} from '@modules/services/awareness-activity-suggestion/popups/awareness-activity-suggestion-approval-popup/awareness-activity-suggestion-approval-popup.component';
import {DialogRef} from './../shared/models/dialog-ref';
import {WFResponseType} from '@enums/wfresponse-type.enum';
import {SearchAwarenessActivitySuggestionCriteria} from '@models/search-awareness-activity-suggestion-criteria';
import {FactoryService} from './factory.service';
import {BaseGenericEService} from '@app/generics/base-generic-e-service';
import {AwarenessActivitySuggestion} from '@models/awareness-activity-suggestion';
import {Injectable} from '@angular/core';
import {CastResponseContainer} from '@app/decorators/decorators/cast-response';
import {HttpClient} from '@angular/common/http';
import {DomSanitizer} from '@angular/platform-browser';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {DialogService} from './dialog.service';
import {DynamicOptionsService} from './dynamic-options.service';
import {UrlService} from './url.service';

@CastResponseContainer({
  $default: {
    model: () => AwarenessActivitySuggestion
  },
})
@Injectable({
  providedIn: 'root'
})
export class AwarenessActivitySuggestionService extends BaseGenericEService<AwarenessActivitySuggestion> {

  jsonSearchFile: string = 'awareness_activity_suggestion.json';
  serviceKey: keyof ILanguageKeys = 'menu_awareness_activity_suggestion';
  caseStatusIconMap: Map<number, string> = new Map();
  searchColumns: string[] = ['fullSerial', 'createdOn', 'creatorInfo', 'caseStatus', 'subject', 'ouInfo'];
  selectLicenseDisplayColumns: string[] = ['enName', 'licenseNumber', 'status', 'actions'];

  constructor(
    private urlService: UrlService,
    public http: HttpClient,
    public dialog: DialogService,
    public domSanitizer: DomSanitizer,
    public dynamicService: DynamicOptionsService,
    private licenseService: LicenseService
  ) {
    super();
    FactoryService.registerService('AwarenessActivitySuggestionService', this)
  }

  _getUrlService(): UrlService {
    return this.urlService
  }
  _getURLSegment(): string {
    return this._getUrlService().URLS.AWARENESS_ACTIVITY_SUGGESTION
  }
  _getModel() {
    return AwarenessActivitySuggestion
  }
  getSearchCriteriaModel<S extends AwarenessActivitySuggestion>(): AwarenessActivitySuggestion {
    return new SearchAwarenessActivitySuggestionCriteria();
  }
  getCaseComponentName(): string {
    return 'AwarenessActivitySuggestionComponent'
  }
  licenseSearch(criteria: Partial<SearchAwarenessActivitySuggestionCriteria> = {}): Observable<AwarenessActivitySuggestion[]> {
    return this.licenseService.awarenessActivitySuggestionSearch(criteria);
  }

  approve(model: AwarenessActivitySuggestion, action: WFResponseType): DialogRef {
    return this.dialog.show(AwarenessActivitySuggestionApprovalPopupComponent, {
      model,
      action
    });
  }
  finalApprove(model: AwarenessActivitySuggestion, action: WFResponseType): DialogRef {
    return this.dialog.show(AwarenessActivitySuggestionApprovalPopupComponent, {
      model,
      action
    });
  }
}
