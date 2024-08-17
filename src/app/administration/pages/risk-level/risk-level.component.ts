import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { FileExtensionsEnum } from '@app/enums/file-extension-mime-types-icons.enum';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { printBlobData } from '@app/helpers/utils';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { RiskLevel } from '@app/models/risk-level';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { RiskLevelService } from '@app/services/risk-level.service';
import { TableComponent } from '@app/shared/components/table/table.component';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { CustomValidators } from '@app/validators/custom-validators';
import { catchError, exhaustMap, filter, of, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'risk-level',
  templateUrl: 'risk-level.component.html',
  styleUrls: ['risk-level.component.scss']
})
export class RiskLevelComponent extends AdminGenericComponent<RiskLevel, RiskLevelService> {
  usePagination = true;

  lang = inject(LangService);
  service = inject(RiskLevelService);
  fb = inject(FormBuilder);
  lookupService = inject(LookupService);
  constructor() {
    super();
  }

  protected _init(): void {
    this.listenToView();
    this.buildFilterForm()
  }

  @ViewChild('table') table!: TableComponent;
  displayedColumns: string[] = ['arName', 'enName', 'actions'];
  searchColumns: string[] = ['search_arName', 'search_enName', 'search_status',];
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
    search_status: {
      key: 'status',
      controlType: 'select',
      property: 'status',
      label: 'lbl_status',
      selectOptions: {
        options: this.lookupService.listByCategory.CommonStatus.filter(status => !status.isRetiredCommonStatus()),
        labelProperty: 'getName',
        optionValueKey: 'lookupKey'
      }
    }

  }

  view$: Subject<RiskLevel> = new Subject<RiskLevel>();
  actions: IMenuItem<RiskLevel>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: 'mdi-pen',
      onClick: (item: RiskLevel) => this.edit$.next(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: 'mdi-eye',
      onClick: (item: RiskLevel) => this.view$.next(item)
    },
    // upload
    {
      type: 'action',
      label: 'upload_file',
      icon: ActionIconsEnum.UPLOAD,
      onClick: (item: RiskLevel) => this.uploadAttachment(item)
    },
    // download
    {
      type: 'action',
      label: 'view_document',
      icon: ActionIconsEnum.ATTACHMENT,
      show:(item:RiskLevel)=>!!item.vsid,
      onClick: (item: RiskLevel) => this.downloadAttachment(item)
    },
  ];




  afterReload(): void {
    this.table && this.table.clearSelection();
  }

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.openViewDialog(model.id).pipe(catchError(_ => of(null)))
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null))
  }
  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      arName: [''], enName: [''], status: [null]
    })
  }
  upload$= new Subject<void>()
  allowedExtensions = [FileExtensionsEnum.PDF];
  selectedRiskLevel?:RiskLevel
  uploadAttachment(riskLevel: RiskLevel) {

    this.selectedRiskLevel = riskLevel;
    this.upload$.next()
  }

  onFileChange(file:File){
    this.selectedRiskLevel?.saveAttachment(file)
  }
  downloadAttachment(riskLevel:RiskLevel){
    riskLevel.downloadAttachment()
  }
  
}

