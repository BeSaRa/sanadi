import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {Localization} from '../../../models/localization';
import {fromEvent, Subscription} from 'rxjs';
import {switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-localization',
  templateUrl: './localization.component.html',
  styleUrls: ['./localization.component.scss']
})
export class LocalizationComponent implements OnInit, AfterViewInit, OnDestroy {
  localization: Localization[] = [];
  displayedColumns: string[] = ['id', 'arName', 'enName', 'localizationKey', 'actions'];
  @ViewChild('reloadButton', {read: ElementRef}) reloadButton: ElementRef;
  private reloadSubscription: Subscription;

  constructor(public lang: LangService) {
  }

  ngOnInit(): void {
    this.localization = this.lang.localization;
  }

  showDialog(): void {
  }

  ngAfterViewInit(): void {
    this.reloadSubscription = fromEvent(this.reloadButton.nativeElement, 'click').pipe(
      switchMap((event) => {
        event.preventDefault();
        return this.lang.loadLocalization();
      })
    ).subscribe((locals) => {
      this.localization = locals;
    });
    // to fire  click event.
    this.reloadButton.nativeElement.click();
  }

  ngOnDestroy(): void {
    this.reloadSubscription.unsubscribe();
  }

}
