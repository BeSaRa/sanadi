import { Component, Inject } from '@angular/core';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { Subject } from 'rxjs';
import { LangService } from '@services/lang.service';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { FollowupService } from '@services/followup.service';
import { Followup } from '@app/models/followup';
import { CaseModel } from '@app/models/case-model';
import { FollowupConfigurationService } from '@services/followup-configuration.service';
import { EmployeeService } from '@services/employee.service';
import { FollowupConfiguration } from '@app/models/followup-configuration';
import { DialogService } from '@services/dialog.service';

@Component({
  selector: 'followup',
  templateUrl: './followup.component.html',
  styleUrls: ['./followup.component.scss']
})
export class FollowupComponent extends AdminGenericComponent<Followup, FollowupService> {
  models: Followup[] = [];
  actions: IMenuItem<Followup>[] = [];
  displayedColumns: string[] = ['requestNumber', 'name', 'serviceType', 'dueDate', 'status', 'orgInfo'];
  searchText = '';
  addFollowup$: Subject<any> = new Subject<any>();
  case!: CaseModel<any, any>;
  showForm = false;
  followupConfigurations: FollowupConfiguration[] = [];
  loadFollowupConfigurations$: Subject<{
    'case-type'?: number
    'request-type'?: number,
    'follow-up-type'?: number
  }> = new Subject<{
    'case-type'?: number
    'request-type'?: number,
    'follow-up-type'?: number
  }>();

  public hasConfiguration: boolean = false;

  constructor(
    public lang: LangService,
    public service: FollowupService,
    private employeeService: EmployeeService,
    private dialog: DialogService,
    private followupConfigService: FollowupConfigurationService,
    @Inject(DIALOG_DATA_TOKEN)
    public data: CaseModel<any, any>) {
    super();
    this.case = data;
  }

  filterCallback = (record: any, searchText: string) => {
    return record.search(searchText);
  };

  _init() {
    this.listenToAddFollowup();
    this.listenToReloadConfigurations();
    const caseModel = (this.case as any);
    this.reload$.next(this.case.id);
    let criteria = {
      'case-type': this.case.caseType,
      'request-type': caseModel.requestTypeInfo ? caseModel.requestTypeInfo.lookupKey : null
    };
    if (!criteria['request-type']) {
      delete criteria['request-type'];
    }
    this.loadFollowupConfigurations$.next(criteria);
  }

  listenToReloadConfigurations() {
    this.loadFollowupConfigurations$
      .pipe(switchMap((criteria) => this.followupConfigService.getByCriteria(criteria)))
      .pipe(tap(c => this.followupConfigurations = c))
      .pipe(map(list => this.hasConfiguration = !!list.length))
      .subscribe(() => {
        !this.hasConfiguration && this.dialog.info(this.lang.map.there_is_no_followup_configurations_for_this_service);
      });
  }

  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(switchMap((caseId: string) => {
        return this.service.getByCaseId(caseId);
      }))
      .subscribe((list: Followup[]) => {
        this.models = list;
      });
  }

  listenToAddFollowup(): void {
    this.addFollowup$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.showForm = true;
      });
  }

  hideForm() {
    this.showForm = false;
  }

}
