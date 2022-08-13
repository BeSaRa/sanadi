import {ComponentFactoryResolver, Injectable} from '@angular/core';
import {CastResponseContainer} from '@decorators/cast-response';
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

  constructor(private urlService: UrlService,
              public domSanitizer: DomSanitizer,
              public cfr: ComponentFactoryResolver,
              public dialog: DialogService,
              public dynamicService: DynamicOptionsService,
              public http: HttpClient) {
    super();
    FactoryService.registerService('GeneralAssociationMeetingAttendanceService', this);
  }

  _getURLSegment(): string {
    return this.urlService.URLS.GENERAL_ASSOCIATION_MEETING_ATTENDANCE;
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
