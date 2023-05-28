import {AfterViewInit, Component, ComponentRef, Inject, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {LangService} from '@services/lang.service';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@contracts/i-dialog-data';
import {CaseModel} from '@models/case-model';
import {CaseAudit} from '@models/case-audit';
import {CaseAuditService} from '@services/case-audit.service';
import {CaseTypes} from '@enums/case-types.enum';

@Component({
  selector: 'case-audit-popup',
  templateUrl: './case-audit-popup.component.html',
  styleUrls: ['./case-audit-popup.component.scss']
})
export class CaseAuditPopupComponent implements AfterViewInit {
  newVersion: CaseModel<any, any>;
  caseAudit: CaseAudit;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<{
                newVersion: CaseModel<any, any>,
                caseAudit: CaseAudit
              }>,
              public lang: LangService,
              private caseAuditService: CaseAuditService) {
    this.newVersion = data.newVersion;
    this.caseAudit = data.caseAudit;
  }

  ngAfterViewInit() {
    Promise.resolve().then(()=> {
      this._renderChangesComponent();
    })
  }

  private componentRef!: ComponentRef<any>;

  @ViewChild('componentContentContainer', {read: ViewContainerRef})
  componentContainer!: ViewContainerRef;

  get popupTitle(): string {
    return this.lang.map.view_changes + ' : ' + this.newVersion.fullSerial
      + ' (' + this.lang.map.version_x.change({x: this.caseAudit.version }) + ')';
  }

  private _clearContainer(): void {
    this.componentContainer.clear();
  }

  private _renderChangesComponent() {
    const componentToRender = this.caseAuditService.auditCaseComponents[this.newVersion.caseType as CaseTypes];
    this._clearContainer();
    if (!componentToRender) {
      console.error('Component is missing! Please add component to auditCaseComponents in CaseAuditService');
      return;
    }
    this.componentRef = this.componentContainer.createComponent<typeof componentToRender>(componentToRender);
    this.componentRef.instance.newVersion = this.newVersion;
    this.componentRef.instance.oldVersion = this.caseAudit.caseObjectParsed;

  }
}
