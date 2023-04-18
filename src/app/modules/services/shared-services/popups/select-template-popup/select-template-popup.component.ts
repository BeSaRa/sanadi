import { ServiceDataService } from '@app/services/service-data.service';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CustomServiceTemplate } from '@app/models/custom-service-template';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { LangService } from '@app/services/lang.service';
import { UntypedFormControl } from '@angular/forms';
import { TableComponent } from '@app/shared/components/table/table.component';
import { BehaviorSubject } from 'rxjs';

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
    private serviceDataService: ServiceDataService,
    @Inject(DIALOG_DATA_TOKEN) private data: {
      caseType: number
    }
  ) {}

  ngOnInit() {
    this.serviceDataService.loadTemplatesbyCaseType(this.data.caseType).subscribe((data) => {
      this.list = data;
    })
  }
  save(template: CustomServiceTemplate) {
    this.dialogRef.close(template)
  }
  close() {
    this.dialogRef.close(null)
  }
}
