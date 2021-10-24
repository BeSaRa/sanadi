import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BackendGenericService} from "@app/generics/backend-generic-service";
import {SDGoal} from "@app/models/sdgoal";
import {FactoryService} from "@app/services/factory.service";
import {UrlService} from "@app/services/url.service";

@Injectable({
  providedIn: 'root'
})
export class SDGoalService extends BackendGenericService<SDGoal> {
  list: SDGoal[] = [];

  _getModel() {
    return SDGoal;
  }

  _getSendInterceptor() {

  }

  _getServiceURL(): string {
    return this.urlService.URLS.SD_GOAL;
  }

  _getReceiveInterceptor() {

  }

  constructor(public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('SDGoalService', this);
  }
}
