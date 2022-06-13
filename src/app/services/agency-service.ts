import {HttpClient, HttpParams} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Generator} from "@app/decorators/generator";
import {AgencyInterceptor} from "@app/model-interceptors/agency-interceptor";
import {Agency} from "@app/models/agency";
import {Observable} from "rxjs";
import {FactoryService} from "./factory.service";
import {UrlService} from "./url.service";

@Injectable({
  providedIn: "root",
})
export class AgencyService {
  constructor(public http: HttpClient, public urlService: UrlService) {
    FactoryService.registerService("AgencyService", this);
  }

  @Generator(Agency, true, {property: "rs", interceptReceive: new AgencyInterceptor().receive})
  loadReceiverNames(type: number, country: number): Observable<Agency[]> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append("type", type);
    queryParams = queryParams.append("country", country);
    return this.http.get<Agency[]>(this.urlService.URLS.CUSTOMS_EXEMPTION_SHIPPING_APPROVAL_SERVICES + "/agency", {
        params: queryParams,
      }
    );
  }
}
