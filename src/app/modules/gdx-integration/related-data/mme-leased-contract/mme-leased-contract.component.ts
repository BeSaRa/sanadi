import { Component, Input } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { CommonUtils } from '@app/helpers/common-utils';
import { DateUtils } from '@app/helpers/date-utils';
import { SortEvent } from '@app/interfaces/sort-event';
import { GdxMmeResponse } from '@app/models/gdx-mme-leased-contract';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import {CustomValidators} from "@app/validators/custom-validators";

@Component({
  selector: 'mme-leased-contract',
  templateUrl: './mme-leased-contract.component.html',
  styleUrls: ['./mme-leased-contract.component.scss']
})
export class MmeLeasedContractComponent {
  @Input() list: GdxMmeResponse[] = [];

  constructor(public lang: LangService) {
  }
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  headerColumn: string[] = ['extra-header'];

  displayedColumns: string[] = [// 'zoneNo',// 'streetNo',// 'buildingNo',// 'floorNo',// 'flatNo',// 'addressText',// 'area',// 'electricityNo',// 'waterNo',// 'pinNO',// 'certificateCode',// 'noAtarizationNo',// 'noAtarizationDate',// 'noAtarizationFromDate',// 'noAtarizationToDate',// 'rentPurpose',
    'contractSignDate',
    'contractFromDate',
    'contractToDate',
    'propertyDeedNo',
    'propertyType',
    'municipality',
    'tenantType',
    'tenantArName',
    'tenantEnName',
    'rentPaymentAmount',
    'rentPaymentDueDay',
    'rentPaymentDueMonth'
  ];
  sortingCallbacks = {
    contractFromDate: (a: GdxMmeResponse, b: GdxMmeResponse, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.contractFromDate),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.contractFromDate);
      return CommonUtils.getSortValue(value1, value2, dir.direction)},
    contractToDate: (a: GdxMmeResponse, b: GdxMmeResponse, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.contractToDate),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.contractToDate);
      return CommonUtils.getSortValue(value1, value2, dir.direction)},
    contractSignDate: (a: GdxMmeResponse, b: GdxMmeResponse, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.contractSignDate),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.contractSignDate);
      return CommonUtils.getSortValue(value1, value2, dir.direction)}
  };

  filterControl: UntypedFormControl = new UntypedFormControl('');

  actions: IMenuItem<GdxMmeResponse>[] = [];
}
