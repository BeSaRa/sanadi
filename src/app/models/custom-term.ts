import {FactoryService} from "@app/services/factory.service";
import {CustomTermService} from "@app/services/custom-term.service";
import {SearchableCloneable} from "@app/models/searchable-cloneable";
import {Observable} from "rxjs";

export class CustomTerm extends SearchableCloneable<CustomTerm> {
  id!: number;
  writeOnly!: boolean;
  generalUserId!: number;
  caseType!: number;
  terms!: string;
  updatedBy!: number;
  clientData!: string;

  service!: CustomTermService;

  constructor() {
    super();
    this.service = FactoryService.getService('CustomTermService');
  }

  create(): Observable<CustomTerm> {
    return this.service.create(this);
  }

  delete(): Observable<boolean> {
    return this.service.delete(this.id);
  }

  save(): Observable<CustomTerm> {
    return this.id ? this.service.update(this) : this.service.create(this);
  }

  update(): Observable<CustomTerm> {
    return this.service.update(this);
  }
}
