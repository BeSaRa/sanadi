import { Component, Inject, OnInit } from '@angular/core';
import { FinancialTransfereeTypes } from '@enums/financial-transferee-types.enum';
import { BaseGenericEService } from '@app/generics/base-generic-e-service';
import { ILanguageKeys } from '@contracts/i-language-keys';
import { AdminResult } from '@models/admin-result';
import { IMenuItem } from '@modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
  selector: 'app-select-pre-registered-popup',
  templateUrl: './select-pre-registered-popup.component.html',
  styleUrls: ['./select-pre-registered-popup.component.scss'],
})
export class SelectPreRegisteredPopupComponent {
  displayedColumns: string[] = ['fulSerial', 'transferringEntityName'];
  label: keyof ILanguageKeys = 'pre_registered_entities';

  constructor(
    public lang: LangService,
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      entities: FinancialTransfereeTypes[];
      select: boolean;
      displayedColumns: string[];
    }
  ) {
    if (this.data.displayedColumns.length > 0) {
      this.displayedColumns = [...this.data.displayedColumns];
    } else {
      this.displayedColumns = [...this.displayedColumns];
    }

    if (!this.displayedColumns.includes('actions')) {
      this.displayedColumns.push('actions');
    }

    if (this.data.select) {
      this.label = 'select_license';
    }
  }
  actions: IMenuItem<any>[] = [
    // select license/document
    {
      type: 'action',
      label: 'select',
      icon: '',
      onClick: (item: any) => this.selectLicense(item),
      show: (_item: any) => this.data.select,
    },
  ];
  selectLicense(license: any): void {
    this.dialogRef.close({ selected: license, details: license });
  }
}
