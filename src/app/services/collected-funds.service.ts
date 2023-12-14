import { ComponentType } from '@angular/cdk/portal';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FundUnit } from '@app/models/fund-unit';
import { DialogService } from './dialog.service';
import { UrlService } from './url.service';
import { CastResponse, CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { Pagination } from '@app/models/pagination';
import { FundSummary } from '@app/models/fund-summary';

@CastResponseContainer({
  $default: {
    model: () => FundUnit,
  },
  $summary: {
    model: () => FundSummary,
  },
  $pagination: {
    model: () => Pagination,
    shape: {'rs.*': () => FundUnit}
  }
})
@Injectable({
  providedIn: 'root'
})
export class CollectedFundsService {
  list: FundUnit[] = [];

  constructor(
    private http: HttpClient,
    private dialog: DialogService,
    private urlService: UrlService
  ) {
  }
  _getServiceURL(): string {
    return this.urlService.URLS.PROJECT_FUNDRAISING + '/license/';
  }
  _getDialogComponent(): ComponentType<any> {
    throw new Error('Method not implemented.');
  }
  _getModel(): new () => FundUnit {
    return FundUnit;
  }
  @CastResponse(undefined, {
    fallback: '$summary',
    unwrap: 'rs'
  })
  loadFundsSummaryByVsId(vsId: string) {
    return this.http.get<FundSummary>(this._getServiceURL() + 'summary', {
      params: new HttpParams({
        fromObject: { vsId }
      })
    })
  }
  @CastResponse(undefined, {
    fallback: '$pagination',
  })
  loadFundsByVsId(vsId: string) {
    return this.http.get<{ rs: FundUnit[] }>(this._getServiceURL() + 'collected', {
      params: new HttpParams({
        fromObject: { vsId }
      })
    })
  }
  
  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  createFundsUnit(body: Partial<FundUnit>) {
    return this.http.post<any>(this._getServiceURL() + 'collected', body)
  }

  approveFund(unit: FundUnit) {
    return this.http.put<FundUnit>(this._getServiceURL() + 'collected/approve/', {}, {
      params: new HttpParams({fromObject: {
        id: unit.id
      }})
    })
  }
  rejectFund(unit: FundUnit) {
    return this.http.put<FundUnit>(this._getServiceURL() + 'collected/reject', {}, {
      params: new HttpParams({fromObject: {
        id: unit.id
      }})
    })
  }
  reFundItem(unit: FundUnit) {
    return this.http.post<FundUnit[]>(this._getServiceURL() + 'collected/refund', {
      id: unit.id
    })
  }
}
