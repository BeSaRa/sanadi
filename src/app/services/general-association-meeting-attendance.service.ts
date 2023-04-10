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
import {SelectMemberPopupComponent} from '@app/modules/services/general-association-meeting-attendance/popups/select-member-popup-component/select-member-popup.component';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {UntypedFormGroup} from '@angular/forms';
import {
  GeneralAssociationMeetingCompleteTaskPopupComponent
} from '@app/modules/services/general-association-meeting-attendance/popups/general-association-meeting-complete-task-popup/general-association-meeting-complete-task-popup.component';
import {
  GeneralAssociationMeetingApproveTaskPopupComponent
} from '@app/modules/services/general-association-meeting-attendance/popups/general-association-meeting-approve-task-popup/general-association-meeting-approve-task-popup.component';
import {GeneralAssociationInternalMemberInterceptor} from '@app/model-interceptors/general-association-internal-member-interceptor';
import {MeetingAttendanceReport} from '@app/models/meeting-attendance-report';
import {IGeneralAssociationMeetingProceedSendToMembers} from '@contracts/i-general-association-meeting-proceed-send-to-members';
import {GeneralMeetingAttendanceNote} from '@app/models/general-meeting-attendance-note';
import {MeetingMemberTaskStatus} from '@app/models/meeting-member-task-status';
import {MeetingPointMemberComment} from '@app/models/meeting-point-member-comment';
import {
  MeetingPointMembersCommentsPopupComponent
} from '@app/modules/services/general-association-meeting-attendance/popups/meeting-point-members-comments-popup/meeting-point-members-comments-popup.component';
import {BlobModel} from '@app/models/blob-model';
import {map} from 'rxjs/operators';
import {CommonUtils} from '@helpers/common-utils';
import {IMyDateModel} from 'angular-mydatepicker';
import {
  SpecificMemberCommentsAndNotesComponent
} from '@app/modules/services/general-association-meeting-attendance/popups/specific-member-comments-and-notes/specific-member-comments-and-notes.component';

@CastResponseContainer({
  $default: {
    model: () => GeneralAssociationMeetingAttendance
  }
})

@Injectable({
  providedIn: 'root'
})
export class GeneralAssociationMeetingAttendanceService extends BaseGenericEService<GeneralAssociationMeetingAttendance> implements IGeneralAssociationMeetingProceedSendToMembers {
  jsonSearchFile: string = 'general-association-meeting-attendance.json';
  serviceKey: keyof ILanguageKeys = 'menu_general_association_meeting_attendance';
  caseStatusIconMap: Map<number, string> = new Map<number, string>();
  searchColumns: string[] = ['fullSerial', 'requestTypeInfo', 'caseStatus', 'subject', 'ouInfo', 'createdOn'];
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

  @HasInterception
  @CastResponse(() => NpoEmployee, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _searchNpoEmployees(criteria: { arabicName?: string, englishName?: string, qId?: string, jobTitle?: string }): Observable<NpoEmployee[]> {
    let criteriaSegment = this.getSearchNPOEmployeeCriteriaSegment(criteria);

    return this.http.get<NpoEmployee[]>(this.getNpoEmployeeURLSegment() + '/search/criteria?' + criteriaSegment);
  }

  searchNpoEmployees(criteria: { arabicName?: string, englishName?: string, qId?: string }): Observable<NpoEmployee[]> {
    return this._searchNpoEmployees(criteria);
  }

  getSearchNPOEmployeeCriteriaSegment(criteria: { arabicName?: string, englishName?: string, qId?: string, jobTitle?: string }) {
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

    if (CommonUtils.isValidValue(criteria.jobTitle)) {
      if (criteriaSegment !== '') {
        criteriaSegment += '&';
      }
      criteriaSegment += ('job-title-id=' + criteria.jobTitle);
    }

    return criteriaSegment;
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

  approveTask(model: GeneralAssociationMeetingAttendance, action: WFResponseType, selectedInternalMembers: GeneralAssociationInternalMember[], meetingDate: IMyDateModel, year: number): DialogRef {
    return this.dialog.show(GeneralAssociationMeetingApproveTaskPopupComponent, {
      model,
      actionType: action,
      service: this,
      selectedInternalMembers,
      meetingDate,
      year
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

  @HasInterception
  @CastResponse(() => MeetingAttendanceReport, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _addFinalMeetingPoints(@InterceptParam() meetingItems: MeetingAttendanceReport, caseId?: string): Observable<MeetingAttendanceReport> {
    return this.http.post<MeetingAttendanceReport>(this._getURLSegment() + '/items/add-update/final/' + caseId, meetingItems);
  }

  addFinalMeetingPoints(meetingItems: MeetingAttendanceReport, caseId?: string): Observable<MeetingAttendanceReport> {
    return this._addFinalMeetingPoints(meetingItems, caseId);
  }

  @CastResponse(() => MeetingAttendanceReport, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _getMeetingPointsForDecisionMaker(caseId?: string): Observable<MeetingAttendanceReport> {
    return this.http.get<MeetingAttendanceReport>(this._getURLSegment() + '/items/' + caseId);
  }

  getMeetingPointsForDecisionMaker(caseId?: string): Observable<MeetingAttendanceReport> {
    return this._getMeetingPointsForDecisionMaker(caseId);
  }

  @CastResponse(() => MeetingAttendanceReport, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _getFinalMeetingPointsForDecisionMaker(caseId?: string): Observable<MeetingAttendanceReport> {
    return this.http.get<MeetingAttendanceReport>(this._getURLSegment() + '/items/final/' + caseId);
  }

  getFinalMeetingPointsForDecisionMaker(caseId?: string): Observable<MeetingAttendanceReport> {
    return this._getFinalMeetingPointsForDecisionMaker(caseId);
  }

  @CastResponse(() => MeetingAttendanceReport, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _getMeetingPointsForMember(caseId?: string): Observable<MeetingAttendanceReport> {
    return this.http.get<MeetingAttendanceReport>(this._getURLSegment() + '/items/user/' + caseId);
  }

  getMeetingPointsForMember(caseId?: string): Observable<MeetingAttendanceReport> {
    return this._getMeetingPointsForMember(caseId);
  }

  proceedSendToMembers(caseId: string): Observable<boolean> {
    return this.http.post<boolean>(this._getURLSegment() + '/to-member/' + caseId, undefined);
  }

  @HasInterception
  @CastResponse(() => GeneralMeetingAttendanceNote, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _addMeetingGeneralNotes(@InterceptParam() meetingItems: GeneralMeetingAttendanceNote[], caseId?: string): Observable<GeneralMeetingAttendanceNote[]> {
    return this.http.post<GeneralMeetingAttendanceNote[]>(this._getURLSegment() + '/' + caseId + '/meeting-comments', meetingItems);
  }

  addMeetingGeneralNotes(meetingNotes: GeneralMeetingAttendanceNote[], caseId?: string): Observable<GeneralMeetingAttendanceNote[]> {
    return this._addMeetingGeneralNotes(meetingNotes, caseId);
  }

  @HasInterception
  @CastResponse(() => GeneralMeetingAttendanceNote, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _addFinalMeetingGeneralNotes(@InterceptParam() meetingItems: GeneralMeetingAttendanceNote[], caseId?: string): Observable<GeneralMeetingAttendanceNote[]> {
    return this.http.post<GeneralMeetingAttendanceNote[]>(this._getURLSegment() + '/' + caseId + '/meeting-comments/final', meetingItems);
  }

  addFinalMeetingGeneralNotes(meetingNotes: GeneralMeetingAttendanceNote[], caseId?: string): Observable<GeneralMeetingAttendanceNote[]> {
    return this._addFinalMeetingGeneralNotes(meetingNotes, caseId);
  }

  @CastResponse(() => GeneralMeetingAttendanceNote, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _getMeetingGeneralNotes(memberId: number, caseId?: string): Observable<GeneralMeetingAttendanceNote[]> {
    return this.http.get<GeneralMeetingAttendanceNote[]>(this._getURLSegment() + '/' + memberId + '/meeting-comments/' + caseId);
  }

  getMeetingGeneralNotes(memberId: number, caseId?: string): Observable<GeneralMeetingAttendanceNote[]> {
    return this._getMeetingGeneralNotes(memberId, caseId);
  }

  @CastResponse(() => GeneralMeetingAttendanceNote, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _getDecisionMakerMeetingGeneralNotes(memberId: number, caseId?: string): Observable<GeneralMeetingAttendanceNote[]> {
    return this.http.get<GeneralMeetingAttendanceNote[]>(this._getURLSegment() + '/' + memberId + '/meeting-comments-decision/' + caseId);
  }

  getDecisionMakerMeetingGeneralNotes(memberId: number, caseId?: string): Observable<GeneralMeetingAttendanceNote[]> {
    return this._getDecisionMakerMeetingGeneralNotes(memberId, caseId);
  }

  @CastResponse(() => MeetingMemberTaskStatus, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _getMemberTaskStatus(caseId?: string): Observable<MeetingMemberTaskStatus[]> {
    return this.http.get<MeetingMemberTaskStatus[]>(this._getURLSegment() + '/{caseId}/' + 'filling-out-task?caseId=' + caseId);
  }

  getMemberTaskStatus(caseId?: string): Observable<MeetingMemberTaskStatus[]> {
    return this._getMemberTaskStatus(caseId);
  }

  terminateMemberTask(taskId?: string): Observable<boolean> {
    return this.http.post<boolean>(this._getURLSegment() + '/task/terminate?tkiid=' + taskId, undefined);
  }

  openViewPointMembersCommentsDialog(membersComments: MeetingPointMemberComment[]): DialogRef {
    return this.dialog.show(MeetingPointMembersCommentsPopupComponent, {
      membersComments
    });
  }

  openViewMemberCommentsAndNotesDialog(internalMember: GeneralAssociationInternalMember, meetingReport: MeetingAttendanceReport, generalNotes: GeneralMeetingAttendanceNote[], userId: number, meetingId: string): DialogRef {
    return this.dialog.show(SpecificMemberCommentsAndNotesComponent, {
      internalMember,
      meetingReport,
      generalNotes,
      userId,
      meetingId
    });
  }

  @HasInterception
  @CastResponse(() => MeetingAttendanceReport, {
    unwrap: '',
    fallback: '$default'
  })
  _generateReport(caseId: string, @InterceptParam() report: MeetingAttendanceReport, @InterceptParam() meetingComments: GeneralMeetingAttendanceNote[]): Observable<BlobModel> {
    let model = {meetingMainItem: report.meetingMainItem, meetingComment: meetingComments};
    return this.http.post(this._getURLSegment() + '/custom-report/' + caseId + '/export', model,
      {responseType: 'blob', observe: 'body'})
      .pipe(map(result => new BlobModel(result, this.domSanitizer)));
  }

  generateReport(caseId: string, report: MeetingAttendanceReport, meetingComments: GeneralMeetingAttendanceNote[]): Observable<BlobModel> {
    return this._generateReport(caseId, report, meetingComments);
  }

  uploadFinalReport(caseId: string, documentTitle: string, finalReport: File): Observable<string> {
    const formData = new FormData();
    formData.append('content', finalReport);
    return this.http.post<string>(this._getURLSegment() + '/' + caseId + '/final-report', formData).pipe(
      map((response: any) => {
        return response.rs;
      })
    );
  }

  @CastResponse(() => BlobModel, {
    unwrap: '',
    fallback: '$default'
  })
  _getFinalReport(documentId: string): Observable<BlobModel> {
    return this.http.post(this._getURLSegment() + '/' + documentId + '/document', undefined,
      {responseType: 'blob', observe: 'body'})
      .pipe(map(result => new BlobModel(result, this.domSanitizer)));
  }

  getFinalReport(documentId: string): Observable<BlobModel> {
    return this.documentService.downloadDocument(documentId);
  }

  downloadFinalReport(documentId: string): Observable<BlobModel> {
    return this.documentService.downloadDocument(documentId);
  }

  @HasInterception
  @CastResponse(() => MeetingAttendanceReport, {
    unwrap: '',
    fallback: '$default'
  })
  _generateInitDocument(caseId: string): Observable<BlobModel> {
    return this.http.get(this._getURLSegment() + '/initial-approve/model/' + caseId + '/export', {
      responseType: 'blob',
      observe: 'body'
    }).pipe(map(blob => new BlobModel(blob, this.domSanitizer)));
  }
  generateInitDocument(caseId: string): Observable<BlobModel> {
    return this._generateInitDocument(caseId);
  }

  @CastResponse(() => GeneralAssociationMeetingAttendance)
  _validateGeneralAssociationMeetingAttendanceByRequestType(requestType: number, oldFullSerial: string): Observable<GeneralAssociationMeetingAttendance> {
    let criteriaObject = {requestType: requestType, oldFullSerial: oldFullSerial};
    return this.http.post<GeneralAssociationMeetingAttendance>(this._getURLSegment() + '/draft/validate', criteriaObject);
  }

  validateLicenseByRequestType(requestType: number, oldFullSerial: string): Observable<GeneralAssociationMeetingAttendance> {
    return this._validateGeneralAssociationMeetingAttendanceByRequestType(requestType, oldFullSerial);
  }


  @CastResponse(undefined)
  getMeetingsByCharityId(id: number) {
    return this.http.get<GeneralAssociationMeetingAttendance[]>(this._getURLSegment() + '/' + id + '/association-meeting');
  }
}
