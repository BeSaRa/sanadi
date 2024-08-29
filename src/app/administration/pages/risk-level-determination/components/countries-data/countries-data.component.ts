import { Component, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { SortEvent } from '@app/interfaces/sort-event';
import { Country } from '@app/models/country';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { CountryService } from '@app/services/country.service';
import { EmployeeService } from '@app/services/employee.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { RiskLevelDeterminationService } from '@app/services/risk-level-determination.service';
import { TableComponent } from '@app/shared/components/table/table.component';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { CustomValidators } from '@app/validators/custom-validators';
import { BehaviorSubject, catchError, exhaustMap, filter, of, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
    selector: 'countries-data',
    templateUrl: 'countries-data.component.html',
    styleUrls: ['countries-data.component.scss']
})
export class CountriesDataComponent extends AdminGenericComponent<Country, CountryService> {

    lang = inject(LangService);
    service = inject(CountryService);
    riskLevelDeterminationService= inject(RiskLevelDeterminationService);
    lookupService = inject(LookupService);
    fb = inject(FormBuilder);
    employeeService = inject(EmployeeService);
    @Input()reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    @Output() riskLevelDeterminationCreated = new EventEmitter()
    constructor() {
        super()
      }


    usePagination = true
    actions: IMenuItem<Country>[] = [];
    displayedColumns: (keyof Country |'actions')[] = ['arName','enName', 'riskLevel', 'requiredAttentionLevel', 'actions'];
    searchColumns: string[] = ['search_arName','search_enName', 'search_riskLevel', 'search_requiredAttentionLevel', 'search_actions'];
    searchColumnsConfig: SearchColumnConfigMap = {
      search_arName: {
        key: 'arName',
        controlType: 'text',
        property: 'arName',
        label: 'arabic_name',
        maxLength: CustomValidators.defaultLengths.ARABIC_NAME_MAX
      },
      search_enName: {
        key: 'enName',
        controlType: 'text',
        property: 'enName',
        label: 'english_name',
        maxLength: CustomValidators.defaultLengths.ENGLISH_NAME_MAX
      },
      search_riskLevel: {
        key: 'riskLevel',
        controlType: 'select',
        property: 'riskLevel',
        label: 'lbl_risk_level',
        selectOptions: {
          options: this.lookupService.listByCategory.RiskLevel,
          labelProperty: 'getName',
          optionValueKey: 'lookupKey'
        }
      },
      search_requiredAttentionLevel: {
        key: 'requiredAttentionLevel',
        controlType: 'select',
        property: 'requiredAttentionLevel',
        label: 'level_of_due_diligence',
        selectOptions: {
          options: this.lookupService.listByCategory.LevelOfDueDiligence,
          labelProperty: 'getName',
          optionValueKey: 'lookupKey'
        }
      },
     
    }
    @Input() headerTitle: keyof ILanguageKeys = {} as keyof ILanguageKeys;
    view$: Subject<Country> = new Subject<Country>();
    editConditions$: Subject<Country> = new Subject<Country>();
  
    @ViewChild('table') table!: TableComponent;
  
    
  
    sortingCallbacks = {
      
      riskLevel: (a: Country, b: Country, dir: SortEvent): number => {
        let value1 = !CommonUtils.isValidValue(a) ? '' : a.riskLevelInfo?.getName().toLowerCase(),
          value2 = !CommonUtils.isValidValue(b) ? '' : b.riskLevelInfo?.getName().toLowerCase();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      },
      requiredAttentionLevel: (a: Country, b: Country, dir: SortEvent): number => {
        let value1 = !CommonUtils.isValidValue(a) ? '' : a.requiredAttentionLevelInfo?.getName().toLowerCase(),
          value2 = !CommonUtils.isValidValue(b) ? '' : b.requiredAttentionLevelInfo?.getName().toLowerCase();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      }
    }
  
    protected _init(): void {
      this.buildActions();
      this.listenToView();
      this.listenToEditConditions();
      this.buildFilterForm();
    }
  
    listenToView(): void {
      this.view$
        .pipe(takeUntil(this.destroy$))
        .pipe(exhaustMap((model) => {
          return this.service.openConditionDialog(model.id).pipe(catchError(_ => of(null)));
        }))
        .pipe(filter((dialog): dialog is DialogRef => !!dialog))
        .pipe(switchMap(dialog => dialog.onAfterClose$))
        .subscribe(() => this.reload$.next(null));
    }
    listenToEditConditions(): void {
      this.editConditions$
        .pipe(takeUntil(this.destroy$))
        .pipe(exhaustMap((model) => {
          return this.service.openConditionDialog(model.id,OperationTypes.UPDATE).pipe(catchError(_ => of(null)));
        }))
        .pipe(filter((dialog): dialog is DialogRef => !!dialog))
        .pipe(switchMap(dialog => dialog.onAfterClose$))
        .pipe(filter((value) => !!value))
        .subscribe((_) => this.riskLevelDeterminationCreated.emit());
    }
  
   
 
   
    private buildActions() {
      // noinspection JSUnusedLocalSymbols
      this.actions = [
        // edit
        {
          type: 'action',
          icon: ActionIconsEnum.EDIT,
          label: 'btn_edit',
          show:(_) => this.employeeService.isInternalUser(),
          onClick: (item: Country) => this.editConditions$.next(item),
        },
       
        // view
        {
          type: 'action',
          icon: ActionIconsEnum.VIEW,
          label: 'view',
          onClick: (item: Country) => this.view$.next(item),
        },
        // logs
        {
          type: 'action',
          icon: ActionIconsEnum.HISTORY,
          label: 'show_logs',
          onClick: (item: Country) => this.showAuditLogs(item)
        },
        
       
      ];
    }
  
   
  
    buildFilterForm() {
      this.columnFilterForm = this.fb.group({
        arName: [''], enName: [''], riskLevel: [null], requiredAttentionLevel: [null] 
      })
    }
    showAuditLogs(record: Country): void {
      if (!this.adminAuditLogService) {
        console.error('Kindly inject "AdminAuditLogService"');
        return;
      }
      this.riskLevelDeterminationService.openCountryAuditLogsDialog(record.id)
        .subscribe((dialog: DialogRef) => {
          dialog.onAfterClose$.subscribe();
        });
    }
  }
  