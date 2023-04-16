import { Component, Inject } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { AdminResult } from '@app/models/admin-result';
import { LessonsLearned } from '@app/models/lessons-learned';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
  selector: 'lessons-learnt-popup',
  templateUrl: './lessons-learnt-popup.component.html',
  styleUrls: ['./lessons-learnt-popup.component.scss']
})
export class LessonsLearntPopupComponent {
  customValidators = CustomValidators
  form: UntypedFormGroup;
  readonly: boolean;
  viewOnly: boolean;
  editItem: boolean;
  model: LessonsLearned;
  lessonsLearntList: AdminResult[];

   constructor(@Inject(DIALOG_DATA_TOKEN)
     public data: {
       form: UntypedFormGroup,
       readonly: boolean,
       viewOnly: boolean,
       editItem: boolean,
       model: LessonsLearned,
       lessonsLearntList: AdminResult[];
     },
     public lang: LangService,
     private dialogRef: DialogRef) {
       this.form = data.form;
       this.readonly = data.readonly;
       this.viewOnly = data.viewOnly;
       this.lessonsLearntList = data.lessonsLearntList
       this.editItem = data.editItem;
       this.model = data.model;
   }
   mapFormTo(form: any): LessonsLearned {
     const model: LessonsLearned = new LessonsLearned().clone(form);

     return model;
   }
   cancel() {
     this.dialogRef.close(null)
   }
   save() {
     this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
   }
   searchNgSelect(term: string, item: AdminResult): boolean {
    return item.ngSelectSearch(term);
  }
}
