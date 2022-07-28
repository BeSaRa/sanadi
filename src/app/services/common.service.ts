import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UrlService } from '@services/url.service';
import { Observable, of } from 'rxjs';
import { CastResponse } from '@decorators/cast-response';
import { Common } from '@app/models/common';
import { catchError, map, tap } from 'rxjs/operators';
import { AdminResult } from '@app/models/admin-result';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  counters?: Common['counters'];
  flags?: Common['flags']

  constructor(private http: HttpClient,
              private urlService: UrlService) {
  }

  _getURLSegment(): string {
    return this.urlService.URLS.COMMON;
  }

  @CastResponse(() => Common, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _loadCounters(): Observable<Common> {
    return this.http.get<Common>(this._getURLSegment() + '/counters');
  }

  loadCounters(): Observable<Common> {
    return this._loadCounters().pipe(tap(counters => {
      this.counters = counters.counters;
      this.flags = counters.flags;
    }));
  }

  hasCounter(key: keyof Common['counters']): boolean {
    return !!(this.counters && this.counters[key] !== '0');
  }

  getCounter(key: keyof Common['counters']): string {
    return (this.counters && this.counters[key]) || '';
  }

  loadAgenciesByAgencyTypeAndCountry(agencyType: number, executionCountry: number): Observable<AdminResult[]> {
    if (!agencyType || !executionCountry) {
      return of([]);
    }
    let queryParams = new HttpParams();
    queryParams = queryParams.append('type', agencyType);
    queryParams = queryParams.append('country', executionCountry);

    return this.http.get(this._getURLSegment() + '/agency', { params: queryParams })
      .pipe(
        catchError((_err: any) => of([])),
        map((result: any) => result.rs.map((x: AdminResult) => AdminResult.createInstance(x)))
      );
  }
}
