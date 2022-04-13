import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, InjectFlags } from "@angular/core";
import { Generator } from "@app/decorators/generator";
import { BackendGenericService } from "@app/generics/backend-generic-service";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AgencyInterceptor } from "@app/model-interceptors/agency-interceptor";
import { Agency } from "@app/models/agency";
import { Observable } from "rxjs";
import { FactoryService } from "./factory.service";
import { UrlService } from "./url.service";

@Injectable({
  providedIn: "root",
})
export class AgencyService extends BackendGenericService<Agency> {
  list: Agency[] = [];
  constructor(public http: HttpClient, public urlService: UrlService) {
    super();
    FactoryService.registerService("AgencyService", this);
  }

  interceptor: IModelInterceptor<Agency> = new AgencyInterceptor();

  _getModel() {
    return Agency;
  }

  _getSendInterceptor() {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.CUSTOMS_EXEMPTION_SHIPPING_APPROVAL_SERVICES;
  }

  _getReceiveInterceptor() {
    return this.interceptor.receive;
  }

  @Generator(undefined, true, { property: "rs" })
  loadReceiverNames(type: number, country: number): Observable<Agency[]> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append("type", type);
    queryParams = queryParams.append("country", country);
    return this.http.get<Agency[]>(this._getServiceURL() + "/agency", {
      params: queryParams,
    });
  }
}
