import {Component, Inject} from '@angular/core';
import { ILanguageKeys } from '@contracts/i-language-keys';
import {LangService} from '@services/lang.service';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {DialogRef} from '@app/shared/models/dialog-ref';

@Component({
  selector: 'select-receiver-entity-popup',
  templateUrl: './select-receiver-entity-popup.component.html',
  styleUrls: ['./select-receiver-entity-popup.component.scss']
})
export class SelectReceiverEntityPopupComponent {
  displayedColumns: string[] = [];
  label: keyof ILanguageKeys = 'license';

  constructor(public lang: LangService, private dialogRef: DialogRef,
              @Inject(DIALOG_DATA_TOKEN) public data: {
                entities: any[],
                select: boolean,
                displayedColumns: string[]
              }) {
    this.displayedColumns = data.displayedColumns;
  }

  selectEntity(member: any): void {
    this.dialogRef.close(member);
  }
}
