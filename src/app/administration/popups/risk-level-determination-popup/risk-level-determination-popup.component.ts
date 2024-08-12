import { Component, inject, Inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { RiskLevel } from '@app/models/risk-level';
import { RiskLevelDetermination } from '@app/models/risk-level-determination';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { RiskLevelService } from '@app/services/risk-level.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable, tap } from 'rxjs';

@Component({
    selector: 'risk-level-determination-popup',
    templateUrl: 'risk-level-determination-popup.component.html',
    styleUrls: ['risk-level-determination-popup.component.scss']
})
export class RiskLevelDeterminationPopupComponent extends AdminGenericDialog<RiskLevelDetermination> {

    form!: UntypedFormGroup;
    model!: RiskLevelDetermination;
    operation: OperationTypes;
    saveVisible = true;

    riskLevels :RiskLevel[]=[]
    
    dialogRef = inject(DialogRef);
    fb = inject(UntypedFormBuilder);
    lang= inject(LangService);
    toast = inject(ToastService);
    lookupService = inject(LookupService);
    riskLevelService = inject(RiskLevelService);


    requiredAttentionLevels = this.lookupService.listByCategory.RiskLevel;
    
  
    constructor(
      @Inject(DIALOG_DATA_TOKEN) data: IDialogData<RiskLevelDetermination>,) {
      super();
      this.model = data.model;
      this.operation = data.operation;
    }
  
    initPopup(): void {
      this.riskLevelService.loadActive()
      .pipe(tap(list=>this.riskLevels = list))
      .subscribe()
    }
  
    buildForm(): void {
      this.form = this.fb.group(this.model.buildForm(true));
      if (this.operation === OperationTypes.VIEW) {
        this.form.disable();
        this.saveVisible = false;
        this.validateFieldsVisible = false;
      }
    }
  
    beforeSave(model: RiskLevelDetermination, form: UntypedFormGroup): Observable<boolean> | boolean {
      return form.valid;
    }
  
    prepareModel(model: RiskLevelDetermination, form: UntypedFormGroup): Observable<RiskLevelDetermination> | RiskLevelDetermination {
      return (new RiskLevelDetermination()).clone({ ...model, ...form.value });
    }
  
    afterSave(model: RiskLevelDetermination, dialogRef: DialogRef): void {
      const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
      this.toast.success(message.change({x: this.lang.map.lbl_risk_level}));
      this.model = model;
      this.operation = OperationTypes.UPDATE;
      dialogRef.close(model);
    }
  
    saveFail(error: Error): void {
    }
  
    get popupTitle(): string {
     if (this.operation === OperationTypes.UPDATE) {
        return this.lang.map.lbl_edit_Risk_level;
      } else if (this.operation === OperationTypes.VIEW) {
        return this.lang.map.view;
      }
      return '';
    };
  
    destroyPopup(): void {
    }
  
  }
