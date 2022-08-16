import {Component, Inject} from '@angular/core';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {FileIconsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {LangService} from '@services/lang.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';

@Component({
  selector: 'select-member-popup-component',
  templateUrl: './select-member-popup.component.html',
  styleUrls: ['./select-member-popup.component.scss']
})
export class SelectMemberPopupComponent{
  displayedColumns: string[] = ['arabicName', 'englishName', 'identificationNumber', 'jobTitle', 'actions'];
  label: keyof ILanguageKeys = 'license';
  fileIconsEnum = FileIconsEnum;

  constructor(public lang: LangService, private dialogRef: DialogRef,
              @Inject(DIALOG_DATA_TOKEN) public data: {
                members: any[],
                select: boolean
              }) {
  }

  selectLicense(member: any): void {
    this.dialogRef.close(member);
  }
}
