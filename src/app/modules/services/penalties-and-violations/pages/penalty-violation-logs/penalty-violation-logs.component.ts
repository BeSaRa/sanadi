import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { PenaltyViolationLog } from '@app/models/penalty-violation-log';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import { PenaltyViolationLogService } from '@app/services/penalty-violation-log.service';
import { PenaltyService } from '@app/services/penalty.service';
import { ProfileService } from '@app/services/profile.service';
import { TableComponent } from '@app/shared/components/table/table.component';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
  selector: 'penalty-violation-logs',
  templateUrl: 'penalty-violation-logs.component.html',
  styleUrls: ['penalty-violation-logs.component.scss']
})
export class PenaltyViolationLogsComponent extends AdminGenericComponent<PenaltyViolationLog, PenaltyViolationLogService> {
  actions: IMenuItem<PenaltyViolationLog>[] = [];
  usePagination = true;

  lang = inject(LangService);
  fb = inject(FormBuilder);
  service = inject(PenaltyViolationLogService);
  penaltyService = inject(PenaltyService);
  profileService = inject(ProfileService); 
  constructor() {
    super();
  }

  protected _init(): void {
    this.buildFilterForm()
  }

  @ViewChild('table') table!: TableComponent;
  displayedColumns: (keyof PenaltyViolationLog)[] = ['incidentNumber', 'penalty','orgId' , 'updatedOn','penaltyDate'];
  searchColumns: string[] = ['search_incident_number', 'search_penalty', 'search_organization'];
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
    //   search_penaltyEn: {
    //     key: 'penaltyEn',
    //     controlType: 'text',
    //     property: 'penaltyEn',
    //     label: 'english_name',
    //     maxLength: CustomValidators.defaultLengths.ENGLISH_NAME_MAX
    //   },
    //   search_status: {
    //     key: 'status',
    //     controlType: 'select',
    //     property: 'status',
    //     label: 'lbl_status',
    //     selectOptions: {
    //       options: this.lookupService.listByCategory.CommonStatus.filter(status => !status.isRetiredCommonStatus()),
    //       labelProperty: 'getName',
    //       optionValueKey: 'lookupKey'
    //     }
    //   }

  }


  sortingCallbacks = {
    //   statusInfo: (a: PenaltyViolationLog, b: PenaltyViolationLog, dir: SortEvent): number => {
    //     let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
    //       value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
    //     return CommonUtils.getSortValue(value1, value2, dir.direction);
    //   }
  }
  afterReload(): void {
    this.table && this.table.clearSelection();
  }


  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      incidentNumber: [''],
      penalty: [null],
      orgId:[null],
    })
  }
  getColumnFilterValue(): Partial<PenaltyViolationLog> {
    const filter = {... this.columnFilterForm.getRawValue() , penalty: [this.columnFilterForm.get('penalty')?.value]};
    return filter;
  }
  getDate(timeStamp?: number) {
    if (!timeStamp) return;

    return new Date(timeStamp)
  }
}

