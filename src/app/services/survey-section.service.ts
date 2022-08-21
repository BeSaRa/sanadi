import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SurveySection } from '@app/models/survey-section';
import { UrlService } from '@app/services/url.service';
import { ComponentType } from '@angular/cdk/portal';
import { DialogService } from './dialog.service';
import {
  SurveySectionPopupComponent
} from "@app/administration/popups/survey-section-popup/survey-section-popup.component";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { SurveySectionInterceptor } from "@app/model-interceptors/survey-section-interceptor";
import { FactoryService } from "@app/services/factory.service";
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";

@Injectable({
  providedIn: 'root',
})
export class SurveySectionService extends CrudWithDialogGenericService<SurveySection> {
  constructor(public http: HttpClient, public dialog: DialogService, public urlService: UrlService) {
    super();
    FactoryService.registerService('SurveySectionService', this);
  }

  list: SurveySection[] = [];
  interceptor: IModelInterceptor<SurveySection> = new SurveySectionInterceptor();

  _getDialogComponent(): ComponentType<any> {
    return SurveySectionPopupComponent;
  }


  _getModel() {
    return SurveySection;
  }

  _getSendInterceptor() {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SURVEY_SECTION
  }

  _getReceiveInterceptor() {
    return this.interceptor.receive;
  }
}
