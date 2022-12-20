import {AdminResult} from "@app/models/admin-result";
import {SearchableCloneable} from "@app/models/searchable-cloneable";
import {normalSearchFields} from "@helpers/normal-search-fields";
import {infoSearchFields} from "@helpers/info-search-fields";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {FactoryService} from "@services/factory.service";
import {ProjectFundraisingService} from "@services/project-fundraising.service";
import {Observable} from "rxjs";

export class ProjectTemplate extends SearchableCloneable<ProjectTemplate> {
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
}
