import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { GdxServicesEnum } from '@app/enums/gdx-services.enum';
import { LangService } from '@services/lang.service';
import { BeneficiaryService } from '@services/beneficiary.service';
import { EmployeeService } from '@services/employee.service';
import { ToastService } from '@services/toast.service';
import { Beneficiary } from '@app/models/beneficiary';
import { GdxServiceLog } from '@app/models/gdx-service-log';
import { UntypedFormControl } from '@angular/forms';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { SortEvent } from '@contracts/sort-event';
import { CommonUtils } from '@helpers/common-utils';
import { DateUtils } from '@helpers/date-utils';
import { exhaustMap, filter, takeUntil } from 'rxjs/operators';
import { IGdxCriteria } from '@contracts/i-gdx-criteria';
import { BeneficiaryIdTypes } from '@app/enums/beneficiary-id-types.enum';

@Component({
  selector: 'integration-inquiry-log-list',
  templateUrl: './integration-inquiry-log-list.component.html',
  styleUrls: ['./integration-inquiry-log-list.component.scss']
})
export class IntegrationInquiryLogListComponent {
  private destroy$: Subject<any> = new Subject<any>();
  actionIconsEnum = ActionIconsEnum;

  constructor(public lang: LangService,
    private beneficiaryService: BeneficiaryService,
    private employeeService: EmployeeService,
    private toast: ToastService) {
  }

  ngOnInit(): void {
    this._listenToAddInquiry();
    this._listenToReloadInquiries();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.onReady.emit(this.gdxServiceId);
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  @Input() gdxServiceId!: GdxServicesEnum;
  @Input() beneficiary!: Beneficiary;
  @Output() onSelect: EventEmitter<GdxServiceLog> = new EventEmitter<GdxServiceLog>();
  @Output() onLoadDone: EventEmitter<GdxServicesEnum> = new EventEmitter<GdxServicesEnum>();
  @Output() onReady: EventEmitter<GdxServicesEnum> = new EventEmitter<GdxServicesEnum>();

  headerColumn: string[] = ['extra-header'];
  private _displayedColumns: string[] = ['workItemStatus', 'organization', 'user', 'actionTime', 'actions'];

  get displayedColumns(): string[] {
    if (this.gdxServiceId === GdxServicesEnum.IZZAB) {
      return ['workItemStatus', 'icons', 'organization', 'user', 'actionTime'];
    }
    return this._displayedColumns;
  }

  logsList: GdxServiceLog[] = [];
  filterControl = new UntypedFormControl('');
  selectedRecord?: GdxServiceLog;
  add$: Subject<any> = new Subject<any>();
  reload$: BehaviorSubject<any> = new BehaviorSubject('init');

  actions: IMenuItem<GdxServiceLog>[] = [
    // select
    {
      type: 'action',
      label: 'select',
      show: () => true,
      disabled: (item) => !item.viewable,
      onClick: (item: GdxServiceLog) => this.selectLog(item)
    }
  ];

  sortingCallbacks = {
    organization: (a: GdxServiceLog, b: GdxServiceLog, dir: SortEvent): number => {
      const value1 = !CommonUtils.isValidValue(a) ? '' : a.orgInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.orgInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    user: (a: GdxServiceLog, b: GdxServiceLog, dir: SortEvent): number => {
      const value1 = !CommonUtils.isValidValue(a) ? '' : a.orgUserInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.orgUserInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    actionTime: (a: GdxServiceLog, b: GdxServiceLog, dir: SortEvent): number => {
      const value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.actionTime),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.actionTime);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };

  selectLog(record: GdxServiceLog): void {
    this.selectedRecord = record;
    this.onSelect.emit(record);
  }

  private _addInquiry() {
    let request;
    switch (this.gdxServiceId) {
      case GdxServicesEnum.MOJ:
        request = this.beneficiaryService.addMOJInquiry(this._getGDXCriteria());
        break;
      case GdxServicesEnum.MOCI:
        request = this.beneficiaryService.addMOCIInquiry(this._getGDXCriteria());
        break;
      case GdxServicesEnum.MAWARED:
        request = this.beneficiaryService.addMAWAREDInquiry(this._getGDXCriteria());
        break;
      case GdxServicesEnum.GARSIA:
        request = this.beneficiaryService.addGarsiaInquiry(this._getGDXCriteria());
        break;
      case GdxServicesEnum.IZZAB:
        request = this.beneficiaryService.addIzzabInquiry(this._getGDXCriteria());
        break;
      case GdxServicesEnum.KAHRAMAA:
        request = this.beneficiaryService.addKahramaaInquiry(this._getGDXCriteria());
        break;
      case GdxServicesEnum.MOL:
        request = this.beneficiaryService.addMOLInquiry(this._getGDXCriteria());
        break;
      case GdxServicesEnum.SJC:
        request = this.beneficiaryService.addSJCInquiry(this._getGDXCriteria());
        break;
      case GdxServicesEnum.MOE:
        request = this.beneficiaryService.addMOEPendingInstallments(this._getGDXCriteria());
        break;
      default:
        request = null;
        break;
    }
    return request;
  }

  private _listenToAddInquiry(): void {
    this.add$
      .pipe(
        takeUntil(this.destroy$),
        exhaustMap(() => this._addInquiry() ?? of(null))
      )
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.toast.success(this.lang.map.msg_added_successfully);
        this._loadGDXIntegrationData();
      });
  }

  private _listenToReloadInquiries(): void {
    this.reload$
      .pipe(
        takeUntil(this.destroy$),
        filter(val => val !== 'init')
      )
      .subscribe(() => {
        this._loadGDXIntegrationData();
      });
  }

  private _getGDXCriteria(): IGdxCriteria {
    return {
      qId: this.getBeneficiaryQID(),
      gdxServiceId: this.gdxServiceId,
      benId: this.beneficiary.id
    };
  }

  getBeneficiaryQID(): string {
    if (!this.beneficiary) {
      return '';
    }
    if (this.beneficiary.benPrimaryIdType === BeneficiaryIdTypes.QID) {
      return this.beneficiary.benPrimaryIdNumber;
    } else if (this.beneficiary.benSecIdNumber && Number(this.beneficiary.benSecIdType) === BeneficiaryIdTypes.QID) {
      return this.beneficiary.benSecIdNumber;
    } else {
      return '';
    }
  }

  private _loadGDXIntegrationData() {
    if (!this.getBeneficiaryQID()) {
      return;
    }
    const criteria = this._getGDXCriteria();
    criteria.orgUserId = this.employeeService.getExternalUser()?.id;
    this.beneficiaryService.loadGDXIntegrationData(criteria)
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.logsList = result;
        this.selectedRecord = undefined;
        this.onLoadDone.emit(this.gdxServiceId);
      });
  }

  izzabHasSheep(record: GdxServiceLog): boolean {
    return this.gdxServiceId === GdxServicesEnum.IZZAB && record.gdxServiceResponseParsed.hasIzzab;
  }
}
