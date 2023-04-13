import {Component, Input} from '@angular/core';
import {CaseModel} from '@models/case-model';
import {LangService} from '@services/lang.service';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {CaseAuditService} from '@services/case-audit.service';
import {CaseAudit} from '@models/case-audit';
import {map} from 'rxjs/operators';

@Component({
  selector: 'case-audit-log',
  templateUrl: './case-audit-log.component.html',
  styleUrls: ['./case-audit-log.component.scss']
})
export class CaseAuditLogComponent {
  constructor(public lang: LangService,
              private caseAuditService: CaseAuditService) {
  }

  private _model!: CaseModel<any, any>;
  @Input()
  set model(value: CaseModel<any, any>) {
    this._model = value;
    this._loadCaseAuditList();
  }

  get model(): CaseModel<any, any> {
    return this._model;
  }

  auditList: CaseAudit[] = [];
  actionIconsEnum = ActionIconsEnum;

  private _loadCaseAuditList(): void {
    this.caseAuditService.loadAuditsByCaseId(this.model.getCaseId())
      .pipe(
        map((result) => {
          // skip the highest version as its same as current version
          return result.sort((a, b) => a.version - b.version).slice(0, -1);
        })
      )
      .subscribe((result) => {
        this.auditList = result;
      });
  }

  openViewChanges(item: CaseAudit): void {
    this.caseAuditService.showCaseModelAuditPopup(this.model, item);
  }
}
