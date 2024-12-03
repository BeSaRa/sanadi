import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { FileNetDocument } from '@app/models/file-net-document';
import { PenaltyViolationLog } from '@app/models/penalty-violation-log';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { EmployeeService } from '@app/services/employee.service';
import { LangService } from '@app/services/lang.service';
import { PenaltiesAndViolationsService } from '@app/services/penalties-and-violations.service';
import { PenaltyViolationLogService } from '@app/services/penalty-violation-log.service';
import { PenaltyService } from '@app/services/penalty.service';
import { ProfileService } from '@app/services/profile.service';
import { TableComponent } from '@app/shared/components/table/table.component';
import { CustomValidators } from '@app/validators/custom-validators';
import { filter, map, take, tap, timer } from 'rxjs';

@Component({
  selector: 'penalty-violation-logs',
  templateUrl: 'penalty-violation-logs.component.html',
  styleUrls: ['penalty-violation-logs.component.scss']
})
export class PenaltyViolationLogsComponent extends AdminGenericComponent<PenaltyViolationLog, PenaltyViolationLogService> {
  usePagination = true;

  lang = inject(LangService);
  fb = inject(FormBuilder);
  service = inject(PenaltyViolationLogService);
  penaltyService = inject(PenaltyService);
  profileService = inject(ProfileService);
  employeeService = inject(EmployeeService);
  penaltyAndViolationService = inject(PenaltiesAndViolationsService);
  constructor() {
    super();
  }

  protected _init(): void {
    this.buildFilterForm()
  }

  @ViewChild('table') table!: TableComponent;
  displayedColumns: (keyof PenaltyViolationLog|'actions')[] = ['incidentNumber', 'penalty', 'orgId', 'updatedOn', 'penaltyDate','actions'];
  searchColumns: string[] = this.employeeService.isInternalUser() ?
    ['search_incident_number', 'search_penalty', 'search_organization'] : ['search_incident_number', 'search_penalty'];
  searchColumnsConfig: SearchColumnConfigMap = {
    search_incident_number: {
      key: 'incidentNumber',
      controlType: 'text',
      property: 'incidentNumber',
      label: 'lbl_incidence_number',
      maxLength: CustomValidators.defaultLengths.ARABIC_NAME_MAX
    },
    search_penalty: {
      key: 'penalty',
      controlType: 'select',
      property: 'penalty',
      label: 'lbl_penalty',
      selectOptions: {
        options$: this.penaltyService.loadActive(),
        labelProperty: 'getName',
        optionValueKey: 'id',
      }
    },
    search_organization: {
      key: 'orgId',
      controlType: 'select',
      property: 'orgId',
      label: 'lbl_the_organization',
      selectOptions: {
        options$: this.profileService.loadActive(),
        labelProperty: 'getName',
        optionValueKey: 'id',
      }
    },

  }

  afterReload(): void {
    this.table && this.table.clearSelection();
  }


  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      incidentNumber: [''],
      penalty: [null],
      orgId: [null],
    })
    timer(0)
      .pipe(
        filter(_ => this.employeeService.isExternalUser()),
        tap(_ => this.columnFilterForm.get('orgId')?.setValue(this.employeeService.getProfile()?.id)),
        take(1)
      )
      .subscribe()
  }
  getPenaltyControl() {
    return this.columnFilterForm.get('penalty')
  };
  getColumnFilterValue(): Partial<PenaltyViolationLog> {
    const penaltyValue = this.columnFilterForm.get('penalty')?.value
    const filter = {
      ... this.columnFilterForm.getRawValue(),
      penalty: !penaltyValue ? null : [penaltyValue]
    };
    return filter;
  }
  getDate(timeStamp?: number) {
    if (!timeStamp) return;

    return new Date(timeStamp)
  }
  actions: IMenuItem<PenaltyViolationLog>[] = [
    // download
    {
      type: 'action',
      label: 'lbl_penalty_book',
      icon: ActionIconsEnum.DOWNLOAD,
      onClick: (item: PenaltyViolationLog) => this._download(item),
      show(item: PenaltyViolationLog) {
        return !!item.case?.exportedLicenseId
      },
    },


  ];
  private _download(item: PenaltyViolationLog) {
    const file =new FileNetDocument().clone({
      documentTitle: this.lang.map.lbl_penalty_book,
      description: this.lang.map.lbl_penalty_book,
    });
    this.penaltyAndViolationService.documentService
      .downloadDocument(item.case?.exportedLicenseId!)
      .pipe(
        take(1),
        map((model) => this.penaltyAndViolationService.documentService.viewDocument(model, file))
      )
      .subscribe()
  }
}

