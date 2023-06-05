import { take } from 'rxjs/operators';
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
import { ToastService } from '@app/services/toast.service';

@Component({
  selector: 'select-custom-service-template-popup',
  templateUrl: './select-custom-service-template-popup.component.html',
  styleUrls: ['./select-custom-service-template-popup.component.scss']
})
export class SelectCustomServiceTemplatePopupComponent implements OnInit {
  list: CustomServiceTemplate[] = [];
  columns: string[] = ['englishName', 'arabicName', 'approvalTemplateType', 'actions'];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  showDelete = false;
  @ViewChild('table') table!: TableComponent;
  constructor(
    private dialogRef: DialogRef,
    public lang: LangService,
    private customServiceTemplate: CustomServiceTemplateService,
    private sharedService: SharedService,
    private toast: ToastService,
    @Inject(DIALOG_DATA_TOKEN) public data: {
      list: CustomServiceTemplate[],
      showSelectBtn: boolean,
      caseType: number,
      showDelete: boolean
    }
  ) {
    this.list = data.list;
    if(data.showDelete){
      this.showDelete = data.showDelete;
    }
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
    },
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      onClick: (item: any) => this.delete(item),
      show: (_item: any) => this.showDelete
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
  delete(template: CustomServiceTemplate) {
    this.customServiceTemplate.deleteDocument(this.data.caseType, template.id)
      .pipe(take(1))
      .subscribe(_ => {
        this.toast.success(this.lang.map.msg_delete_x_success.change({ x: template.getName() }));
        this.list = [...this.list.filter(x => x.id !== template.id)];
      });
  }
  save(template: CustomServiceTemplate) {
    template.arName = template.arabicName
    template.enName = template.englishName
    this.dialogRef.close(template)
  }
  close() {
    this.dialogRef.close(null)
  }
}
