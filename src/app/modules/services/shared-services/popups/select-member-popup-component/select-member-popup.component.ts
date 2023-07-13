import {Component, Inject} from '@angular/core';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {FileIconsEnum} from '@enums/file-extension-mime-types-icons.enum';
import {LangService} from '@services/lang.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';

@Component({
  selector: 'select-member-popup-component',
  templateUrl: './select-member-popup.component.html',
  styleUrls: ['./select-member-popup.component.scss']
})
export class SelectMemberPopupComponent{
  displayedColumns: string[] = [];
  label: keyof ILanguageKeys = 'members';
  fileIconsEnum = FileIconsEnum;

  constructor(public lang: LangService, private dialogRef: DialogRef,
              @Inject(DIALOG_DATA_TOKEN) public data: {
                members: any[],
                select: boolean,
                isInternalMembers: boolean,
                displayedColumns: string[]
              }) {
    if(data.displayedColumns.length) {
      this.displayedColumns = [...data.displayedColumns, 'actions'];
    }else if(data.isInternalMembers) {
      this.displayedColumns = ['arabicName', 'englishName', 'actions'];
    } else {
      this.displayedColumns = ['arabicName', 'englishName','identificationNumber', 'jobTitle', 'actions'];
    }
  }

  selectMember(member: any): void {
    this.dialogRef.close(member);
  }
}
