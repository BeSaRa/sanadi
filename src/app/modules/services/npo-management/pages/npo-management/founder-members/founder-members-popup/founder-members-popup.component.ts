import { Component, Inject } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { FounderMembers } from '@app/models/founder-members';
import { JobTitle } from '@app/models/job-title';
import { Lookup } from '@app/models/lookup';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
  selector: 'founder-members-popup',
  templateUrl: './founder-members-popup.component.html',
  styleUrls: ['./founder-members-popup.component.scss']
})
export class FounderMembersPopupComponent {
  form: UntypedFormGroup;
  readonly: boolean;
  editIndex: number;
  model: FounderMembers;
  founderMembersFormArray:UntypedFormArray;
  nationalityList: Lookup[];
  jobTitleAdminLookup: JobTitle[];
  constructor(@Inject(DIALOG_DATA_TOKEN)
   public data: {
     form: UntypedFormGroup,
     readonly: boolean,
     editIndex: number,
     model: FounderMembers,
     founderMembersFormArray:UntypedFormArray,
     nationalityList:Lookup[],
     jobTitleAdminLookup: JobTitle[]
   },
     public lang: LangService,
     private dialogRef: DialogRef) {
     this.form = data.form;
     this.readonly = data.readonly;
     this.editIndex = data.editIndex;
     this.model = data.model;
     this.founderMembersFormArray = data.founderMembersFormArray
     this.nationalityList = data.nationalityList
     this.jobTitleAdminLookup = data.jobTitleAdminLookup
   }

   mapFormTo(form: any): FounderMembers {
    const model: FounderMembers = new FounderMembers().clone(form);

    return model;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }
  searchNgSelect(term: string, item: any): boolean {
    return item.ngSelectSearch(term);
  }
}
