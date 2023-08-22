import { CharityReportType } from './../../../../../enums/charity-report-type.enum';
import { Component, Input } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { CharityReport } from '@app/models/charity-report';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CaseAuditService } from '@app/services/case-audit.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
    selector: 'audit-charity-reports',
    templateUrl: 'audit-charity-reports.component.html',
    styleUrls: ['audit-charity-reports.component.scss']
})
export class AuditCharityReportsComponent extends AuditListGenericComponent<CharityReport> {
  @Input() reportType!: CharityReportType;
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  displayColumns: string[] =[
    'fullName',
    'generalDate',
    'feedback',
    'reportStatus',
    'actions',
  ];
  actions: IMenuItem<CharityReport>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  _getNewInstance(override: Partial<CharityReport> | undefined): CharityReport {
    if (CommonUtils.isValidValue(override)) {
      return new CharityReport().clone(override)
    }
    return new CharityReport();
  }

  getControlLabels(item: CharityReport): { [p: string]: ControlValueLabelLangKey } {
    if(this.reportType == CharityReportType.RISK) {
      return item.getRistValuesWithLabels();
    } else if(this.reportType == CharityReportType.SUPPORT) {
      return item.getSupportValuesWithLabels();
    } else {
      return item.getIncomingValuesWithLabels();
    }
  }
}

