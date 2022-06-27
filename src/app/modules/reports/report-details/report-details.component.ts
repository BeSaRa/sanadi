import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { ConfigurationService } from "@services/configuration.service";
import { pluck, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { LangService } from "@services/lang.service";

@Component({
  selector: 'report-details',
  templateUrl: './report-details.component.html',
  styleUrls: ['./report-details.component.scss']
})
export class ReportDetailsComponent implements OnInit, OnDestroy {
  safeUrl!: SafeUrl
  private destroy$: Subject<any> = new Subject<any>();

  constructor(private domSanitizer: DomSanitizer,
              private activeRoute: ActivatedRoute,
              private lang: LangService,
              private config: ConfigurationService) { }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.destroy$.unsubscribe()
  }

  ngOnInit(): void {
    this.prepareSafeUrl();
  }

  private prepareSafeUrl(): void {
    this.activeRoute.paramMap
      .pipe(takeUntil(this.destroy$))
      .pipe(pluck<any, string>('url'))
      .subscribe((url: string) => {
        this.safeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.config.CONFIG.REPORTS_URL + url + '?rs:embed=true')
      })
  }
}
