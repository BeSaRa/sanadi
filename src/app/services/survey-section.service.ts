import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BackendGenericService } from '@app/generics/backend-generic-service';
import { SurveySection } from '@app/models/survey-section';
import { UrlService } from '@app/services/url.service';

@Injectable({
  providedIn: 'root',
})
export class SurveySectionService extends BackendGenericService<SurveySection> {
  list: SurveySection[] = [];

  _getModel() {
    return SurveySection;
  }

  _getSendInterceptor() {

  }

  _getServiceURL(): string {
    return this.urlService.URLS.SURVEY_SECTION
  }

  _getReceiveInterceptor() {

  }

  constructor(public http: HttpClient, public urlService: UrlService) {
    super();
  }
}
