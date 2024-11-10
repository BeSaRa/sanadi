import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { DateUtils } from '@app/helpers/date-utils';
import { CrudServiceInterface } from '@app/interfaces/crud-service-interface';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { PenaltyViolationLog } from '@app/models/penalty-violation-log';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import { PenaltyViolationLogService } from '@app/services/penalty-violation-log.service';
import { TableComponent } from '@app/shared/components/table/table.component';
import { CustomValidators } from '@app/validators/custom-validators';
import { takeUntil, filter, switchMap, Observable, map, catchError, of } from 'rxjs';

@Component({
    selector: 'penalty-violation-logs',
    templateUrl: 'penalty-violation-logs.component.html',
    styleUrls: ['penalty-violation-logs.component.scss']
})
export class PenaltyViolationLogsComponent extends AdminGenericComponent<PenaltyViolationLog, PenaltyViolationLogService> {
    actions: IMenuItem<PenaltyViolationLog>[]=[];
    usePagination = true;
  
    lang = inject(LangService);
    fb=inject(FormBuilder);
    service = inject(PenaltyViolationLogService);
  
    constructor() {
      super();
    }
  
    protected _init(): void {
      this.buildFilterForm()
    }
  
    @ViewChild('table') table!: TableComponent;
    displayedColumns: string[] = ['incidentNumber' ,'penaltyNumber','penalty','statusDateModified','penaltyDate'];
    searchColumns: string[] = ['search_incident_number', 'search_penaltyEn', 'search_status',];
    searchColumnsConfig: SearchColumnConfigMap = {
      search_incident_number: {
        key: 'incidentNumber',
        controlType: 'text',
        property: 'incidentNumber',
        label: 'lbl_incidence_text',
        maxLength: CustomValidators.defaultLengths.ARABIC_NAME_MAX
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
        incidentNumber: ['']
      })
    }
    listenToReload() {
        this.reload$
          .pipe(takeUntil((this.destroy$)))
          .pipe(
            filter(() => {
              if (this.columnFilterFormHasValue()) {
                this.columnFilter$.next('filter');
                return false;
              }
              return true;
            })
          )
          .pipe(switchMap(() => {

            return this.service.loadActive() .pipe(map((res) => {
                this.count = res.length;
                return res;
              })) 
          
            
          }))
          .subscribe((list: PenaltyViolationLog[]) => {
            if (!this.usePagination) {
              this.count = list.length;
            }
            this.models = list;
            console.log(this.models[0].case);
            
          })
      }
    getDate(timeStamp?:number){
       if(!timeStamp) return;

       return new Date(timeStamp)
    }
  }
  
  