import {Component, Inject} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {Subject} from 'rxjs';
import {LangService} from '@services/lang.service';
import {map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {FollowupService} from '@services/followup.service';
import {Followup} from '@app/models/followup';
import {CaseModel} from '@app/models/case-model';
import {ServiceDataFollowupConfigurationService} from '@services/service-data-followup-configuration.service';
import {EmployeeService} from '@services/employee.service';
import {ServiceDataFollowupConfiguration} from '@models/service-data-followup-configuration';
import {DialogService} from '@services/dialog.service';
import {SortEvent} from '@contracts/sort-event';
import {CommonUtils} from '@helpers/common-utils';

@Component({
  selector: 'followup',
  templateUrl: './followup.component.html',
  styleUrls: ['./followup.component.scss']
})
export class FollowupComponent extends AdminGenericComponent<Followup, FollowupService> {
  models: Followup[] = [];
  actions: IMenuItem<Followup>[] = [];
  displayedColumns: string[] = ['requestNumber', 'requestType', 'name', 'serviceType', 'dueDate', 'status', 'orgInfo'];
  addFollowup$: Subject<any> = new Subject<any>();
  case!: CaseModel<any, any>;
  showForm = false;
  followupConfigurations: ServiceDataFollowupConfiguration[] = [];
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
    private followupConfigService: ServiceDataFollowupConfigurationService,
    @Inject(DIALOG_DATA_TOKEN)
    public data: CaseModel<any, any>) {
    super();
    this.case = data;
  }

  sortingCallbacks = {
    requestNumber: (a: Followup, b: Followup, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.caseId.toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.caseId.toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    name: (a: Followup, b: Followup, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    serviceInfo: (a: Followup, b: Followup, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.serviceInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.serviceInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    requestType: (a: Followup, b: Followup, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.requestTypeInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.requestTypeInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    statusInfo: (a: Followup, b: Followup, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    orgInfo: (a: Followup, b: Followup, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.orgInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.orgInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
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
    this.reload$.next(this.case.id);
  }

}
