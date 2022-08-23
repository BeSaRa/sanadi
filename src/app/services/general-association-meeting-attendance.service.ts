import {ComponentFactoryResolver, Injectable} from '@angular/core';
import {CastResponse, CastResponseContainer} from '@decorators/cast-response';
import {GeneralAssociationMeetingAttendance} from '@app/models/general-association-meeting-attendance';
import {BaseGenericEService} from '@app/generics/base-generic-e-service';
import {HttpClient} from '@angular/common/http';
import {DomSanitizer} from '@angular/platform-browser';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {DialogService} from './dialog.service';
import {DynamicOptionsService} from './dynamic-options.service';
import {UrlService} from './url.service';
import {FactoryService} from '@services/factory.service';
import {GeneralAssociationMeetingAttendanceSearchCriteria} from '@app/models/general-association-meeting-attendance-search-criteria';
import {HasInterception} from '@decorators/intercept-model';
import {Observable} from 'rxjs';
import {NpoEmployee} from '@app/models/npo-employee';
import {GeneralAssociationExternalMember} from '@app/models/general-association-external-member';
import {SelectMemberPopupComponent} from '@app/projects/pages/shared/select-member-popup-component/select-member-popup.component';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {GeneralAssociationExternalMemberInterceptor} from '@app/model-interceptors/general-association-external-member-interceptor';

@CastResponseContainer({
  $default: {
    model: () => GeneralAssociationMeetingAttendance
  }
})

@Injectable({
  providedIn: 'root'
})
export class GeneralAssociationMeetingAttendanceService extends BaseGenericEService<GeneralAssociationMeetingAttendance> {
  jsonSearchFile: string = 'general-association-meeting-attendance.json';
  serviceKey: keyof ILanguageKeys = 'menu_general_association_meeting_attendance';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = [];
  externalMembersInterceptor: GeneralAssociationExternalMemberInterceptor = new GeneralAssociationExternalMemberInterceptor();

  constructor(private urlService: UrlService,
              public domSanitizer: DomSanitizer,
              public cfr: ComponentFactoryResolver,
              public dialog: DialogService,
              public dynamicService: DynamicOptionsService,
              public http: HttpClient) {
    super();
    FactoryService.registerService('GeneralAssociationMeetingAttendanceService', this);
  }

  // @HasInterception
  // @CastResponse(() => NpoEmployee, {
  //   unwrap: 'rs',
  //   fallback: '$default'
  // })
  // private _searchNpoEmployees(options?: any): Observable<NpoEmployee[]> {
  //   return this.http.get<NpoEmployee[]>(this.getNpoEmployeeURLSegment() + '/composite', {
  //     params: (new HttpParams({ fromObject: options }))
  //   });
  // }

  @HasInterception
  @CastResponse(() => NpoEmployee, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _searchNpoEmployees(options?: any): Observable<NpoEmployee[]> {
    return this.http.get<NpoEmployee[]>(this.getNpoEmployeeURLSegment() + '/search/criteria?q-id=' + options.qId + '&arabic-name=' + options.arabicName + '&english-name=' + options.englishName);
  }

  searchNpoEmployees(options?: any): Observable<NpoEmployee[]> {
    return this._searchNpoEmployees(options);
  }

  openSelectMemberDialog(members: GeneralAssociationExternalMember[], select = true): DialogRef {
    return this.dialog.show(SelectMemberPopupComponent, {
      members,
      select
    });
  }

  _getURLSegment(): string {
    return this.urlService.URLS.GENERAL_ASSOCIATION_MEETING_ATTENDANCE;
  }

  getNpoEmployeeURLSegment(): string {
    return this.urlService.URLS.NPO_EMPLOYEE;
  }

  _getModel() {
    return GeneralAssociationMeetingAttendance;
  }

  getSearchCriteriaModel<S extends GeneralAssociationMeetingAttendance>(): GeneralAssociationMeetingAttendance {
    return new GeneralAssociationMeetingAttendanceSearchCriteria();
  }

  getCaseComponentName(): string {
    return 'GeneralAssociationMeetingAttendanceComponent';
  }

  _getUrlService(): UrlService {
    return this.urlService;
  }

}
