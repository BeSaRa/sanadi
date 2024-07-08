import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { ConfigurationService } from "@services/configuration.service";
import { takeUntil, tap } from "rxjs/operators";
import { Subject } from "rxjs";
import { LangService } from "@services/lang.service";

@Component({
  selector: 'report-details',
  templateUrl: './report-details.component.html',
  styleUrls: ['./report-details.component.scss']
})
export class ReportDetailsComponent implements OnInit, OnDestroy {
  safeUrl!: SafeUrl
  private destroy$: Subject<void> = new Subject();

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
    this.listenToLangChange()
  }

  private prepareSafeUrl(): void {
    this.activeRoute.paramMap
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(v => console.log(v)))
      .subscribe((params) => {
        this.generateUrl(params)
      })
  }

  private generateUrl(params: ParamMap): void {
    this.safeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.config.CONFIG.REPORTS_URL + params.get('url')?.split(':').join('/').replace('lang', this.lang.map.lang) + '?rs:embed=true')
  }

  private listenToLangChange(): void {
    this.lang.onLanguageChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.generateUrl(this.activeRoute.snapshot.paramMap)
      })
  }
}
