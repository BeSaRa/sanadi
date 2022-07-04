import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { UrlService } from "@services/url.service";
import { Observable } from "rxjs";
import { CastResponse } from "@decorators/cast-response";
import { Common } from "@app/models/common";
import { tap } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  counters?: Common['counters']

  constructor(private http: HttpClient,
              private urlService: UrlService) {
  }

  @CastResponse(() => Common, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _loadCounters(): Observable<Common> {
    return this.http.get<Common>(this.urlService.URLS.COMMON + '/counters');
  }

  loadCounters(): Observable<Common> {
    return this._loadCounters().pipe(tap(counters => this.counters = counters.counters))
  }

  hasCounter(key: keyof Common["counters"]): boolean {
    return !!(this.counters && this.counters[key] !== '0')
  }

  getCounter(key: keyof Common['counters']): string {
    return (this.counters && this.counters[key]) || ''
  }
}
