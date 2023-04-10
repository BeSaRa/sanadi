import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { CommonUtils } from '@app/helpers/common-utils';
import { SortEvent } from '@app/interfaces/sort-event';
import { GdxMoeInstallment } from '@app/models/gdx-moe-Installment';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import { PaginatorComponent } from '@app/shared/components/paginator/paginator.component';

@Component({
  selector: 'moe-installments',
  templateUrl: './moe-installments.component.html',
  styleUrls: ['./moe-installments.component.scss']
})
export class MoeInstallmentsComponent {
  @Input() list: GdxMoeInstallment[] = [];

  @ViewChild('paginator') paginator!: PaginatorComponent;

  constructor(public lang: LangService) {
  }

  headerColumn: string[] = ['extra-header'];
  
  displayedColumns: string[] = ['feeHeadTypeEN', 'feeHeadTypeAR', 'schoolYear', 'amount'];

  filterControl: UntypedFormControl = new UntypedFormControl('');
  
  
  actions: IMenuItem<GdxMoeInstallment>[] = [];
}
