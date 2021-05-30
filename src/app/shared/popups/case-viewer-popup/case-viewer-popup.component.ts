import {AfterViewInit, Component, Inject, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {Subject} from 'rxjs';
import {ILanguageKeys} from '../../../interfaces/i-language-keys';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {IESComponent} from '../../../interfaces/iescomponent';
import {SaveTypes} from '../../../enums/save-types';
import {IMenuItem} from '../../../modules/context-menu/interfaces/i-menu-item';
import {DialogRef} from '../../models/dialog-ref';

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
  actions: IMenuItem[] = [];

  model: any;

  constructor(@Inject(DIALOG_DATA_TOKEN)
              public data: {
                key: keyof ILanguageKeys,
                model: any,
                actions: IMenuItem[]
              },
              private dialogRef: DialogRef,
              public lang: LangService) {

    this.model = this.data.model;
  }

  ngOnInit(): void {
    this.actions = this.data.actions.filter((action) => this.filterAction(action));
  }

  ngAfterViewInit(): void {
    this.viewInit.next();
    this.viewInit.complete();
    this.viewInit.unsubscribe();
  }

  displayLabel(action: IMenuItem): string {
    return typeof action.label === 'function' ? action.label(this.model) : this.lang.map[action.label as unknown as keyof ILanguageKeys];
  }

  takeAction(action: IMenuItem) {
    action.onClick && action.onClick(this.model);
    action.data?.closeViewerAfterClick && this.dialogRef.close();
  }

  private filterAction(action: IMenuItem) {
    return action.type === 'action' && !action.data?.hideFromViewer && (!action.show ? true : action.show(this.model));
  }
}
