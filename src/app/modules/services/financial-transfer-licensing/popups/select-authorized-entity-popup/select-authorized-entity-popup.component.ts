import { Component, Inject } from '@angular/core';
import { ILanguageKeys } from '@contracts/i-language-keys';
import { ILicenseSearch } from '@contracts/i-license-search';
import { AdminResult } from '@models/admin-result';
import { IMenuItem } from '@modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-select-authorized-entity-popup',
  templateUrl: './select-authorized-entity-popup.component.html',
  styleUrls: ['./select-authorized-entity-popup.component.scss'],
})
export class SelectAuthorizedEntityPopupComponent {
  displayedColumns: string[] = [
    'arName',
    'enName',
    'licenseNumber'
  ];
  label: keyof ILanguageKeys = 'authorized_entities';

  constructor(
    public lang: LangService,
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      entities: AdminResult[] ;
      select: boolean;
      displayedColumns: string[];
      service:ILicenseSearch<any>;
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
      show: (_item: any) => this.data.select
    },


  ];
  selectLicense(license: any): void {
    this.data.service.licenseSearchById(license.fnId)
    .pipe(
      take(1),
      tap(entity=>{
        this.dialogRef.close({ selected: license, details: entity });
      })
    ).subscribe()
  }
}
