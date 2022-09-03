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
import {HasInterception, InterceptParam} from '@decorators/intercept-model';
import {Observable} from 'rxjs';
import {NpoEmployee} from '@app/models/npo-employee';
import {GeneralAssociationExternalMember} from '@app/models/general-association-external-member';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {GeneralAssociationExternalMemberInterceptor} from '@app/model-interceptors/general-association-external-member-interceptor';
import {GeneralAssociationInternalMember} from '@app/models/general-association-internal-member';
import {SelectMemberPopupComponent} from '@app/projects/pages/shared/select-member-popup-component/select-member-popup.component';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {UntypedFormGroup} from '@angular/forms';
import {
  GeneralAssociationMeetingCompleteTaskPopupComponent
} from '@app/projects/popups/general-association-meeting-complete-task-popup/general-association-meeting-complete-task-popup.component';
import {
  GeneralAssociationMeetingApproveTaskPopupComponent
} from '@app/projects/popups/general-association-meeting-approve-task-popup/general-association-meeting-approve-task-popup.component';
import {GeneralAssociationInternalMemberInterceptor} from '@app/model-interceptors/general-association-internal-member-interceptor';
import {MeetingAttendanceReport} from '@app/models/meeting-attendance-report';
import {IDefaultResponse} from '@contracts/idefault-response';
import {map} from 'rxjs/operators';
import {IGeneralAssociationMeetingProceedSendToMembers} from '@contracts/i-general-association-meeting-proceed-send-to-members';

@CastResponseContainer({
  $default: {
    model: () => GeneralAssociationMeetingAttendance
  }
})

@Injectable({
  providedIn: 'root'
})
export class GeneralAssociationMeetingAttendanceService extends BaseGenericEService<GeneralAssociationMeetingAttendance> implements IGeneralAssociationMeetingProceedSendToMembers{
  jsonSearchFile: string = 'general-association-meeting-attendance.json';
  serviceKey: keyof ILanguageKeys = 'menu_general_association_meeting_attendance';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = [];
  externalMembersInterceptor: GeneralAssociationExternalMemberInterceptor = new GeneralAssociationExternalMemberInterceptor();
  internalMembersInterceptor: GeneralAssociationInternalMemberInterceptor = new GeneralAssociationInternalMemberInterceptor();

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

  openSelectMemberDialog(members: GeneralAssociationExternalMember[] | GeneralAssociationInternalMember[], select = true, isInternalMembers: boolean): DialogRef {
    return this.dialog.show(SelectMemberPopupComponent, {
      members,
      select,
      isInternalMembers
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

  completeTask(model: GeneralAssociationMeetingAttendance, action: WFResponseType, form: UntypedFormGroup, selectedAdministrativeBoardMembers: GeneralAssociationExternalMember[], selectedGeneralAssociationMembers: GeneralAssociationExternalMember[], agendaItems: string[]): DialogRef {
    return this.dialog.show(GeneralAssociationMeetingCompleteTaskPopupComponent, {
      model,
      actionType: action,
      service: this,
      form,
      selectedAdministrativeBoardMembers,
      selectedGeneralAssociationMembers,
      agendaItems
    });
  }

  approveTask(model: GeneralAssociationMeetingAttendance, action: WFResponseType, selectedInternalMembers: GeneralAssociationInternalMember[]): DialogRef {
    return this.dialog.show(GeneralAssociationMeetingApproveTaskPopupComponent, {
      model,
      actionType: action,
      service: this,
      selectedInternalMembers
    });
  }

  @HasInterception
  @CastResponse(() => MeetingAttendanceReport, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _addMeetingPoints(@InterceptParam() meetingItems: MeetingAttendanceReport, caseId?: string): Observable<MeetingAttendanceReport> {
    return this.http.post<MeetingAttendanceReport>(this._getURLSegment() + '/items/add-update/' + caseId, meetingItems);
  }

  addMeetingPoints(meetingItems: MeetingAttendanceReport, caseId?: string): Observable<MeetingAttendanceReport> {
    return this._addMeetingPoints(meetingItems, caseId);
  }

  @CastResponse(() => MeetingAttendanceReport, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _getMeetingPoints(caseId?: string): Observable<MeetingAttendanceReport> {
    return this.http.get<MeetingAttendanceReport>(this._getURLSegment() + '/items/user/' + caseId);
  }

  getMeetingPoints(caseId?: string): Observable<MeetingAttendanceReport> {
    return this._getMeetingPoints(caseId);
  }

  proceedSendToMembers(caseId: string): Observable<boolean> {
    return this.http.post<IDefaultResponse<boolean>>(this._getURLSegment() + '/to-member/' + caseId, undefined)
      .pipe(map(response => response.rs));
  }
}
