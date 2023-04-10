import { Component, Input, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { CommonUtils } from '@app/helpers/common-utils';
import { SortEvent } from '@app/interfaces/sort-event';
import { GdxMoeResponse } from '@app/models/gdx-moe-pending-installments';
import { GdxMoePrivateSchoolPendingPayment } from '@app/models/gdx-moe-private-school-pending-payment';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import { PaginatorComponent } from '@app/shared/components/paginator/paginator.component';

@Component({
  selector: 'moe-pending-payment',
  templateUrl: './moe-pending-payment.component.html',
  styleUrls: ['./moe-pending-payment.component.scss']
})
export class MoePendingPaymentComponent {
  @Input() list: GdxMoePrivateSchoolPendingPayment[] = [];

  @ViewChild('paginator') paginator!: PaginatorComponent;
  constructor(public lang: LangService) {
  }

  headerColumn: string[] = ['extra-header'];
  
  displayedColumns: string[] = ['schoolNameEN', 'schoolNameAR', 'schoolYear'];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  
  
  actions: IMenuItem<GdxMoeResponse>[] = [];
}
