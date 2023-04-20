import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CustomServiceTemplate } from '@app/models/custom-service-template';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { LangService } from '@app/services/lang.service';
import { UntypedFormControl } from '@angular/forms';
import { TableComponent } from '@app/shared/components/table/table.component';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { SharedService } from '@app/services/shared.service';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { CustomServiceTemplateService } from '@app/services/custom-service-template.service';

@Component({
  selector: 'app-select-template-popup',
  templateUrl: './select-template-popup.component.html',
  styleUrls: ['./select-template-popup.component.scss']
})
export class SelectTemplatePopupComponent implements OnInit {
  list: CustomServiceTemplate[] = [];
  columns: string[] = ['englishName', 'arabicName', 'actions'];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  @ViewChild('table') table!: TableComponent;
  constructor(
    private dialogRef: DialogRef,
    public lang: LangService,
    private customServiceTemplate: CustomServiceTemplateService,
    private sharedService: SharedService,
    @Inject(DIALOG_DATA_TOKEN) private data: {
      list: CustomServiceTemplate[],
      showSelectBtn: boolean,
      caseType: number
    }
  ) {
    this.list = data.list;
  }
  actions: IMenuItem<any>[] = [
    {
      type: 'action',
      label: 'select',
      icon: '',
      onClick: (item: any) => this.save(item),
      show: (_item: any) => this.data.showSelectBtn
    },
    {
      type: 'action',
      label: 'btn_download',
      icon: ActionIconsEnum.DOWNLOAD,
      onClick: (item: any) => this.download(item),
      show: (_item: any) => true
    }
  ]
  ngOnInit() {
  }
  download(template: CustomServiceTemplate) {
    this.customServiceTemplate.loadTemplateDocId(this.data.caseType, template.id).subscribe((result) => {
      if (result.blob.size === 0) {
        return;
      }
      this.sharedService.downloadFileToSystem(result.blob)
    })
  }
  save(template: CustomServiceTemplate) {
    this.dialogRef.close(template)
  }
  close() {
    this.dialogRef.close(null)
  }
}
