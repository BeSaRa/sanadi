import { LangService } from '@services/lang.service';
import { Component, Inject } from '@angular/core';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { InspectionOperation } from '@app/models/inspection-operation';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { Observable } from 'rxjs';

@Component({
    selector: 'inspection-operation-children-popup',
    templateUrl: 'inspection-operation-children-popup.component.html',
    styleUrls: ['inspection-operation-children-popup.component.scss']
})
export class InspectionOperationChildrenPopupComponent  {
  model: InspectionOperation;
 

constructor(public lang:LangService,
  public dialogRef: DialogRef,
  @Inject(DIALOG_DATA_TOKEN) data: IDialogData<InspectionOperation>,) {
    this.model = data.model;
  
}
get popupTitle(): string {
  
   return '';
 };
}
