import { ControlValueLabelLangKey } from './../types/types';
import { AdminResult } from "@app/models/admin-result";
import { SearchableCloneable } from "@app/models/searchable-cloneable";
import { normalSearchFields } from "@helpers/normal-search-fields";
import { infoSearchFields } from "@helpers/info-search-fields";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { FactoryService } from "@services/factory.service";
import { ProjectFundraisingService } from "@services/project-fundraising.service";
import { Observable } from "rxjs";
import { CommonUtils } from "@app/helpers/common-utils";
import { AuditOperationTypes } from '@app/enums/audit-operation-types';

export class ProjectTemplate extends SearchableCloneable<ProjectTemplate> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  templateId!: string;
  projectName!: string
  templateFullSerial!: string
  publicStatus!: number
  templateCost!: number
  templateStatus!: number
  templateStatusInfo!: AdminResult
  publicStatusInfo!: AdminResult

  searchFields = {
    ...normalSearchFields(['projectName', 'templateFullSerial', 'templateCost']),
    ...infoSearchFields(['templateStatusInfo', 'publicStatusInfo'])
  }

  service: ProjectFundraisingService

  constructor() {
    super();
    this.service = FactoryService.getService('ProjectFundraisingService')
  }

  viewTemplate(): Observable<DialogRef> {
    return this.service.viewTemplate(this)
  }

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      templateId: { langKey: 'project_total_cost', value: this.templateId },
      projectName: { langKey: 'project_name', value: this.projectName },
      templateFullSerial: { langKey: 'serial_number', value: this.templateFullSerial },
      publicStatus: { langKey: 'public_status', value: this.publicStatus },
      templateCost: { langKey: 'total_cost', value: this.templateCost },
      templateStatus: { langKey: 'review_status', value: this.templateStatus },
    };
  }
  getAdminResultByProperty(property: keyof ProjectTemplate): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'templateStatus':
        adminResultValue = this.templateStatusInfo;
        break;
      case 'publicStatus':
        adminResultValue = this.publicStatusInfo;
        break;
      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({ arName: value as string, enName: value as string });
    }
    return adminResultValue ?? new AdminResult();
  }
}
