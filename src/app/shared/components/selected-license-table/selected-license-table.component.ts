import {Component, EventEmitter, Input, Output} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {LicenseService} from '@app/services/license.service';
import {SharedService} from '@app/services/shared.service';
import {FileIconsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {CaseTypes} from '@app/enums/case-types.enum';
import {CustomsExemptionRemittanceService} from '@app/services/customs-exemption-remittance.service';
import {DialogService} from '@services/dialog.service';
import {filter, take} from 'rxjs/operators';
import {UserClickOn} from '@app/enums/user-click-on.enum';

@Component({
  selector: 'selected-license-table',
  templateUrl: './selected-license-table.component.html',
  styleUrls: ['./selected-license-table.component.scss']
})
export class SelectedLicenseTableComponent {
  constructor(public lang: LangService,
              private dialog: DialogService,
              private licenseService: LicenseService,
              private sharedService: SharedService,
              private customsExemptionRemittanceService: CustomsExemptionRemittanceService) {
  }

  @Input() caseType!: number;
  @Input() caseTypeViewLicense!: number;
  @Input() licenseList!: any[];
  @Input() columns: string[] = ['arName', 'enName', 'licenseNumber', 'status', 'endDate', 'actions'];
  @Input() allowSelect: boolean = false;
  @Output() selectCallback: EventEmitter<any> = new EventEmitter<any>();
  @Output() clearLicense: EventEmitter<any> = new EventEmitter<any>();
  licenses: any[] = [];
  fileIconsEnum = FileIconsEnum;
  actions: IMenuItem<any>[] = [
    // select license
    {
      type: 'action',
      label: 'select',
      icon: '',
      onClick: (item: any) => this.selectLicense(item),
      show: (_item: any) => this.allowSelect
    },
    // view license
    {
      type: 'action',
      label: 'view_license',
      icon: FileIconsEnum.PDF,
      onClick: (item: any) => this.viewLicenseAsPDF(item)
    },
    // view license
    {
      type: 'action',
      label: 'btn_clear',
      icon: 'mdi-delete',
      onClick: (_item: any) => this.removeSelectedLicense()
    }
  ];

  selectLicense(license: any) {
    this.selectCallback.emit(license);
  }

  viewLicenseAsPDF(license: any): void {
    if (!this.caseTypeViewLicense) {
      console.error('caseTypeViewLicense is missing');
      return;
    }
    if (this.caseType === CaseTypes.SHIPPING_APPROVAL) {
      let doc = {...license, documentTitle: license.fullSerial};
      this.customsExemptionRemittanceService
        .showDocumentContent(doc, this.caseType)
        .subscribe((file) => {
          return this.sharedService.openViewContentDialog(file, doc);
        });
    } else {
      this.licenseService
        .showLicenseContent(license, this.caseTypeViewLicense)
        .subscribe((file) => {
          return this.sharedService.openViewContentDialog(file, license);
        });
    }
  }

  private removeSelectedLicense(): void {
    this.dialog
      .confirm(this.lang.map.msg_confirm_delete_x.change({x: this.licenseList[0].fullSerial}))
      .onAfterClose$
      .pipe(take(1))
      .pipe(filter((click: UserClickOn) => click === UserClickOn.YES))
      .subscribe(() => {
        this.clearLicense.emit(null);
        this.licenseList = [];
      });
  }
}
