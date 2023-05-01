import { ControlValueLabelLangKey } from './../../../../../types/types';
import { Component, Input, OnInit } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { AuditListGenericComponent } from '@app/generics/audit-list-generic-component';
import { LangService } from '@app/services/lang.service';
import { CaseAuditService } from '@app/services/case-audit.service';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { FundSource } from '@app/models/fund-source';

@Component({
  selector: 'audit-fund-source',
  templateUrl: './audit-fund-source.component.html',
  styleUrls: ['./audit-fund-source.component.scss']
})
export class AuditFundSourceComponent extends AuditListGenericComponent<FundSource> implements OnInit {
  constructor(public lang: LangService,
    public caseAuditService: CaseAuditService) {
    super();
  }
  @Input() isGrant: boolean = false;
  displayColumns: string[] = ['fullName', 'notes', 'totalCost', 'actions'];
  actions: IMenuItem<FundSource>[] = [
    // show difference
    {
      type: 'action',
      label: 'view_changes',
      icon: ActionIconsEnum.MENU,
      onClick: (item) => this.showRecordDifferences(item),
      show: (item) => item.auditOperation !== AuditOperationTypes.NO_CHANGE
    }
  ];

  ngOnInit(): void {
    this.isGrant && this.displayColumns.unshift('fullName')
  }
  _getNewInstance(override: Partial<FundSource> | undefined): FundSource {
    if (CommonUtils.isValidValue(override)) {
      return new FundSource().clone(override)
    }
    return new FundSource();
  }

  getControlLabels(item: FundSource): { [p: string]: ControlValueLabelLangKey } {
    return item.getValuesWithLabels();
  }
}
