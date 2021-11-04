import {AfterViewInit, Component, Inject, NgZone, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {Subject} from 'rxjs';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {IESComponent} from '@app/interfaces/iescomponent';
import {SaveTypes} from '@app/enums/save-types';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {DialogRef} from '../../models/dialog-ref';
import {take} from 'rxjs/operators';
import {OpenFrom} from '@app/enums/open-from.enum';
import {CaseModel} from '@app/models/case-model';
import {QueryResult} from '@app/models/query-result';
import {EServiceGenericService} from '@app/generics/e-service-generic-service';

@Component({
  selector: 'case-viewer-popup',
  templateUrl: './case-viewer-popup.component.html',
  styleUrls: ['./case-viewer-popup.component.scss']
})
export class CaseViewerPopupComponent implements OnInit, AfterViewInit {

  @ViewChild('template', {read: ViewContainerRef, static: true})
  container!: ViewContainerRef;

  viewInit: Subject<any> = new Subject<any>();
  _component!: IESComponent;
  openedFrom!: OpenFrom;

  set component(component: IESComponent) {
    this.zone.onStable
      .pipe(take(1))
      .subscribe(() => {
        this._component = component;
      });
  }

  get component(): IESComponent {
    return this._component;
  }

  saveTypes: typeof SaveTypes = SaveTypes;
  actions: IMenuItem<CaseModel<any, any> | QueryResult>[] = [];
  // the model that the user clicked on it
  model: CaseModel<any, any> | QueryResult;
  // the model that we load to display inside the viewer
  loadedModel: CaseModel<any, any> | QueryResult;

  constructor(@Inject(DIALOG_DATA_TOKEN)
              public data: {
                key: keyof ILanguageKeys,
                model: any,
                actions: IMenuItem<CaseModel<any, any> | QueryResult>[],
                openedFrom: OpenFrom,
                loadedModel: any,
                componentService: EServiceGenericService<any>
              },
              private zone: NgZone,
              private dialogRef: DialogRef,
              public lang: LangService) {

    this.model = this.data.model;
    this.openedFrom = this.data.openedFrom;
    this.loadedModel = this.data.loadedModel;
  }

  ngOnInit(): void {
    this.actions = this.data.actions.filter((action) => this.filterAction(action));
  }

  ngAfterViewInit(): void {
    this.viewInit.next();
    this.viewInit.complete();
    this.viewInit.unsubscribe();
  }

  displayLabel(action: IMenuItem<CaseModel<any, any> | QueryResult>): string {
    return typeof action.label === 'function' ? action.label(this.model) : this.lang.map[action.label as unknown as keyof ILanguageKeys];
  }

  takeAction(action: IMenuItem<CaseModel<any, any> | QueryResult>) {
    action.onClick && action.onClick(this.model, this.dialogRef, this.loadedModel, this.component);
  }

  private filterAction(action: IMenuItem<CaseModel<any, any> | QueryResult>) {
    return action.type === 'action' && (!action.show ? true : action.show(this.model));
  }

  saveCase(): void {
    if (this.component.readonly) {
      return;
    }
    this.component?.save?.next(this.saveTypes.FINAL);
  }

  hideAction(action: IMenuItem<CaseModel<any, any> | QueryResult>): boolean {
    if (action.data?.hasOwnProperty('hideFromViewer')) {
      return typeof action.data?.hideFromViewer === 'function' ? action.data.hideFromViewer(this.loadedModel, this.model) : action.data?.hideFromViewer!;
    } else {
      return false;
    }
  }

  validateForm(): void {
    this.component && this.component.formValidity$?.next('case-viewer');
  }
}
