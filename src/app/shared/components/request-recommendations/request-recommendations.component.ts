import {Component, Input, OnInit} from '@angular/core';
import {ITableOptions} from '@app/interfaces/i-table-options';
import {FilterEventTypes} from '@app/types/types';
import {LangService} from '@app/services/lang.service';
import {AdminResult} from '@app/models/admin-result';
import {CaseTypes} from "@app/enums/case-types.enum";

// noinspection AngularMissingOrInvalidDeclarationInModule
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
    const specialist = {
        roleInfo: AdminResult.createInstance({
          arName: this.langService.getArabicLocalByKey('role_specialist'),
          enName: this.langService.getEnglishLocalByKey('role_specialist')
        }),
        comment: !this.record ? '' : this.record.specialistJustification,
        actionInfo: !this.record ? null : this.record.specialistDecisionInfo,
        order: 1,
        show: true
      },
      secondSpecialist = {
        roleInfo: AdminResult.createInstance({
          arName: this.langService.getArabicLocalByKey('role_second_specialist'),
          enName: this.langService.getEnglishLocalByKey('role_second_specialist')
        }),
        comment: !this.record ? '' : this.record.secondSpecialistJustification,
        actionInfo: !this.record ? null : this.record.secondSpecialistDecisionInfo,
        order:2 ,
        show: true
      },
      reviewerDepartment = {
        roleInfo: AdminResult.createInstance({
          arName: this.langService.getArabicLocalByKey('role_reviewer_department'),
          enName: this.langService.getEnglishLocalByKey('role_reviewer_department')
        }),
        comment: !this.record ? '' : this.record.reviewerDepartmentJustification,
        actionInfo: !this.record ? null : this.record.reviewerDepartmentDecisionInfo,
        order: 3,
        show: true
      },
      chief = {
        roleInfo: AdminResult.createInstance({
          arName: this.langService.getArabicLocalByKey('role_chief'),
          enName: this.langService.getEnglishLocalByKey('role_chief')
        }),
        comment: !this.record ? '' : this.record.chiefJustification,
        actionInfo: !this.record ? null : this.record.chiefDecisionInfo,
        order: 4,
        show: true
      },
      generalManager = {
        roleInfo: AdminResult.createInstance({
          arName: this.langService.getArabicLocalByKey('role_general_manager'),
          enName: this.langService.getEnglishLocalByKey('role_general_manager')
        }),
        comment: !this.record ? '' : this.record.generalManagerJustification,
        actionInfo: !this.record ? null : this.record.generalManagerDecisionInfo,
        order: 5,
        show: true
      },
      manager = {
        roleInfo: AdminResult.createInstance({
          arName: this.langService.getArabicLocalByKey('role_manager'),
          enName: this.langService.getEnglishLocalByKey('role_manager')
        }),
        comment: !this.record ? '' : this.record.managerJustification,
        actionInfo: !this.record ? null : this.record.managerDecisionInfo,
        order: 6,
        show: true
      },
      developmentExpert = {
        roleInfo: AdminResult.createInstance({
          arName: this.langService.getArabicLocalByKey('role_development_expert'),
          enName: this.langService.getEnglishLocalByKey('role_development_expert')
        }),
        comment: !this.record ? '' : this.record.developmentExpertJustification,
        actionInfo: !this.record ? null : this.record.developmentExpertDecisionInfo,
        order: 7,
        show: true
      },
      constructionExpert = {
        roleInfo: AdminResult.createInstance({
          arName: this.langService.getArabicLocalByKey('role_construction_expert'),
          enName: this.langService.getEnglishLocalByKey('role_construction_expert')
        }),
        comment: !this.record ? '' : this.record.constructionExpertJustification,
        actionInfo: !this.record ? null : this.record.constructionExpertDecisionInfo,
        order: 8,
        show: true
      }

    this.data = [specialist, reviewerDepartment, chief, manager];
    if (this.record.caseType === CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL) {
      this.data.push(generalManager);
    }
    if (this.record.caseType === CaseTypes.INTERNAL_PROJECT_LICENSE) {
      this.data.push(secondSpecialist, developmentExpert, constructionExpert);
    }
    this.data = this.data.filter(item => item.show).slice().sort((a, b) => a.order - b.order);
  }
}
