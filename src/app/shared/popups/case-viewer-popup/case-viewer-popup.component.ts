import {AfterViewInit, Component, Inject, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {Subject} from 'rxjs';
import {ILanguageKeys} from '../../../interfaces/i-language-keys';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {IESComponent} from '../../../interfaces/iescomponent';
import {SaveTypes} from '../../../enums/save-types';

@Component({
  selector: 'case-viewer-popup',
  templateUrl: './case-viewer-popup.component.html',
  styleUrls: ['./case-viewer-popup.component.scss']
})
export class CaseViewerPopupComponent implements OnInit, AfterViewInit {

  @ViewChild('template', {read: ViewContainerRef, static: true})
  container!: ViewContainerRef;

  viewInit: Subject<any> = new Subject<any>();

  component?: IESComponent;
  saveTypes: typeof SaveTypes = SaveTypes;

  constructor(public lang: LangService,
              @Inject(DIALOG_DATA_TOKEN)
              public data: keyof ILanguageKeys) {

  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.viewInit.next();
    this.viewInit.complete();
    this.viewInit.unsubscribe();
  }

}
