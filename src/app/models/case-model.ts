import {AdminResult} from './admin-result';
import {TaskDetails} from './task-details';
import {FileNetModel} from './FileNetModel';
import {EServiceGenericService} from '../generics/e-service-generic-service';
import {Observable} from 'rxjs';
import {CaseStatus} from '../enums/case-status.enum';

export abstract class CaseModel<S extends EServiceGenericService<T, S>, T extends FileNetModel<T>> extends FileNetModel<T> {
  serial!: number;
  fullSerial!: string;
  caseState!: number;
  caseStatus!: CaseStatus;
  caseIdentifier!: string;
  caseType!: number;
  taskDetails!: TaskDetails;
  caseStatusInfo!: AdminResult;
  categoryInfo!: AdminResult;
  recommendation!: string;
  competentDepartmentID!: number;
  competentDepartmentAuthName!: string;
  assignDate!: string;
  className!: string;
  service!: S;

  create(): Observable<T> {
    return this.service.create(this as unknown as T);
  }

  update(): Observable<T> {
    return this.service.update(this as unknown as T);
  }

  save(): Observable<T> {
    return this.id ? this.update() : this.create();
  }

  commit(): Observable<T> {
    return this.service.commit(this as unknown as T);
  }

  draft(): Observable<T> {
    return this.service.draft(this as unknown as T);
  }

  start(): Observable<boolean> {
    return this.service.start(this.id);
  }

  canDraft(): boolean {
    return !this.caseStatus || this.caseStatus <= CaseStatus.DRAFT;
  }

  canSave(): boolean {
    return this.caseStatus === CaseStatus.CREATED;
  }

  canCommit(): boolean {
    return this.caseStatus === CaseStatus.DRAFT;
  }

  canStart(): boolean {
    return this.caseStatus < CaseStatus.STARTED && this.caseStatus === CaseStatus.CREATED;
  }
}
