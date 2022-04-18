import {Component, EventEmitter, Input, Output} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {LicenseService} from '@app/services/license.service';
import {SharedService} from '@app/services/shared.service';
import {FileIconsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';

@Component({
  selector: 'selected-license-table',
  templateUrl: './selected-license-table.component.html',
  styleUrls: ['./selected-license-table.component.scss']
})
export class SelectedLicenseTableComponent {

  constructor(public lang: LangService,
              private licenseService: LicenseService,
              private sharedService: SharedService) {

  }

  @Input() caseType!: number;
  @Input() caseTypeViewLicense!: number;
  @Input() licenseList!: any[];
  @Input() columns: string[] = ['arName', 'enName', 'licenseNumber', 'status', 'endDate', 'actions'];
  @Input() allowSelect: boolean = false;
  @Output() selectCallback: EventEmitter<any> = new EventEmitter<any>();

  licenses: any[] = [];
  fileIconsEnum = FileIconsEnum;
  actions: IMenuItem<any>[] = [
    // select license
    {
      type: 'action',
      label: 'select',
      icon: '',
      onClick: (item: any) => this.selectLicense(item),
      show: (item: any) => this.allowSelect
    },
    // view license
    {
      type: 'action',
      label: 'view_license',
      icon: FileIconsEnum.PDF,
      onClick: (item: any) => this.viewLicenseAsPDF(item)
    }
  ]

  selectLicense(license: any) {
    this.selectCallback.emit(license);
  }

  viewLicenseAsPDF(license: any): void {
    if (!this.caseTypeViewLicense){
      console.error('caseTypeViewLicense is missing');
      return;
    }
    this.licenseService.showLicenseContent(license, this.caseTypeViewLicense)
      .subscribe((file) => {
        return this.sharedService.openViewContentDialog(file, license);
      });
  }
}
