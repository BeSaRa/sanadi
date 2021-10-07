import {Component, Input, OnInit} from '@angular/core';
import {ITableOptions} from '@app/interfaces/i-table-options';
import {FilterEventTypes} from '@app/types/types';
import {LangService} from '@app/services/lang.service';
import {AdminResult} from '@app/models/admin-result';
import {CaseStatus} from "@app/enums/case-status.enum";
import {CaseTypes} from "@app/enums/case-types.enum";

@Component({
  selector: 'request-recommendations',
  templateUrl: './request-recommendations.component.html',
  styleUrls: ['./request-recommendations.component.scss']
})
export class RequestRecommendationsComponent implements OnInit {
  @Input() record!: any;

  data: any[] = [];

  tableOptions: ITableOptions = {
    ready: false,
    columns: ['role', 'decision', 'comment'],
    searchText: '',
    isSelectedRecords: () => {
      return false;
    },
    searchCallback: (record: any, searchText: string) => {
    },
    filterCallback: (type: FilterEventTypes = 'OPEN') => {
    },
    sortingCallbacks: {}
  };

  constructor(public langService: LangService) {
  }

  ngOnInit(): void {
    this._buildData();
  }

  private _buildData(): void {
    this.data = [
      {
        roleInfo: AdminResult.createInstance({
          arName: this.langService.getArabicLocalByKey('role_specialist'),
          enName: this.langService.getEnglishLocalByKey('role_specialist')
        }),
        comment: !this.record ? '' : this.record.specialistJustification,
        actionInfo: !this.record ? null : this.record.specialistDecisionInfo,
        show: true
      },
      {
        roleInfo: AdminResult.createInstance({
          arName: this.langService.getArabicLocalByKey('role_reviewer_department'),
          enName: this.langService.getEnglishLocalByKey('role_reviewer_department')
        }),
        comment: !this.record ? '' : this.record.reviewerDepartmentJustification,
        actionInfo: !this.record ? null : this.record.reviewerDepartmentDecisionInfo,
        show: true
      },
      {
        roleInfo: AdminResult.createInstance({
          arName: this.langService.getArabicLocalByKey('role_manager'),
          enName: this.langService.getEnglishLocalByKey('role_manager')
        }),
        comment: !this.record ? '' : this.record.managerJustification,
        actionInfo: !this.record ? null : this.record.managerDecisionInfo,
        show: true
      },
      {
        roleInfo: AdminResult.createInstance({
          arName: this.langService.getArabicLocalByKey('role_general_manager'),
          enName: this.langService.getEnglishLocalByKey('role_general_manager')
        }),
        comment: !this.record ? '' : this.record.generalManagerJustification,
        actionInfo: !this.record ? null : this.record.generalManagerDecisionInfo,
        show: this.record.caseType === CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL
      },
      {
        roleInfo: AdminResult.createInstance({
          arName: this.langService.getArabicLocalByKey('role_chief'),
          enName: this.langService.getEnglishLocalByKey('role_chief')
        }),
        comment: !this.record ? '' : this.record.chiefJustification,
        actionInfo: !this.record ? null : this.record.chiefDecisionInfo,
        show: true
      }
    ];

    this.data = this.data.filter(item => item.show)
  }
}
