import {Component, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '@services/lang.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {Direction} from '@angular/cdk/bidi';
import {RequestTypeFollowupService} from "@services/request-type-followup.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  scrollDirection: Direction = 'rtl';
  private destroy$: Subject<void> = new Subject();

  constructor(private langService: LangService,
              private _requestTypeService: RequestTypeFollowupService) {

  }

  ngOnInit(): void {
    this.langService
      .onLanguageChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe((language) => {
        this.scrollDirection = language.direction;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
