import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {exhaustMap, filter, takeUntil, tap} from 'rxjs/operators';
import {GdxServicesEnum} from '@app/enums/gdx-services.enum';
import {GdxServiceLog} from '@app/models/gdx-service-log';
import {TabMap} from '@app/types/types';
import {BehaviorSubject, Subject} from 'rxjs';
import {GdxMojResponse} from '@app/models/gdx-moj-response';
import {GdxMociResponse} from '@app/models/gdx-moci-response';
import {FormControl} from '@angular/forms';
import {SortEvent} from '@contracts/sort-event';
import {CommonUtils} from '@helpers/common-utils';
import {DateUtils} from '@helpers/date-utils';
import {LangService} from '@services/lang.service';
import {ITabData} from '@contracts/i-tab-data';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {BeneficiaryService} from '@services/beneficiary.service';
import {ToastService} from '@services/toast.service';
import {Beneficiary} from '@app/models/beneficiary';
import {BeneficiaryIdTypes} from '@app/enums/beneficiary-id-types.enum';
import {IGdxCriteria} from '@contracts/i-gdx-criteria';
import {EmployeeService} from '@services/employee.service';

@Component({
  selector: 'gdx-beneficiary-integration',
  templateUrl: './gdx-beneficiary-integration.component.html',
  styleUrls: ['./gdx-beneficiary-integration.component.scss']
})
export class GdxBeneficiaryIntegrationComponent implements OnInit, OnDestroy {
  private destroy$: Subject<any> = new Subject<any>();
  @Input('beneficiary') beneficiary!: Beneficiary;

  constructor(public langService: LangService,
              private beneficiaryService: BeneficiaryService,
              private employeeService: EmployeeService,
              private toast: ToastService) {
  }

  ngOnInit(): void {
    this.listenToAddIntegrationInquiries();
    this.listenToReloadIntegrationInquiries();
    this._buildIntegrationActions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  tabData: TabMap = {
    moj: {
      name: 'moj',
      index: 0,
      langKey: 'integration_moj',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      serviceId: GdxServicesEnum.MOJ + '',
      isLoaded: false
    },
    moci: {
      name: 'moci',
      index: 1,
      langKey: 'integration_moci',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      serviceId: GdxServicesEnum.MOCI + '',
      isLoaded: false
    },
  };
  tabIndex$: Subject<number> = new Subject<number>();

  headerColumn: string[] = ['extra-header'];

  mojLogs: GdxServiceLog[] = [];
  mojRelatedData: GdxMojResponse = {flatInfoList: [], parcelInfoList: []};
  mociLogs: GdxServiceLog[] = [];
  mociRelatedDataList: GdxMociResponse[] = [];

  addMOJ$: Subject<any> = new Subject<any>();
  reloadMOJ$: BehaviorSubject<any> = new BehaviorSubject<any>('init');

  addMOCI$: Subject<any> = new Subject<any>();
  reloadMOCI$: BehaviorSubject<any> = new BehaviorSubject<any>('init');

  displayColumnsMap: any = {
    gdxServiceLog: ['organization', 'user', 'actionTime', 'actions'],
    mojRelatedFlats: ['transactionNo', 'transactionType', 'ownerName', 'contractDate', 'ownerShares'],
    mojRelatedParcels: ['parcelNo', 'parcelType', 'ownerName', 'city', 'zone', 'sharesCount'],
    mociRelatedCompanies: ['companyName', 'licenceNumber', 'companyStatus', 'relation', 'relationStatus']
  };
  filterControlsMap: { [key: string]: FormControl } = {
    moj: new FormControl(''),
    moci: new FormControl(''),
    mojRelatedFlats: new FormControl(''),
    mojRelatedParcels: new FormControl(''),
    mociRelatedCompanies: new FormControl('')
  };
  sortingCallbacksMap = {
    gdxServiceLog: {
      organizationAndBranch: (a: GdxServiceLog, b: GdxServiceLog, dir: SortEvent): number => {
        const value1 = !CommonUtils.isValidValue(a) ? '' : a.orgAndBranchInfo?.getName().toLowerCase(),
          value2 = !CommonUtils.isValidValue(b) ? '' : b.orgAndBranchInfo?.getName().toLowerCase();
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
    },
    mojRelatedFlats: {},
    mojRelatedParcels: {},
    mociRelatedCompanies: {
      companyName: (a: GdxMociResponse, b: GdxMociResponse, dir: SortEvent): number => {
        const value1 = !CommonUtils.isValidValue(a) ? '' : a.primaryEstablishmentName.toLowerCase(),
          value2 = !CommonUtils.isValidValue(b) ? '' : b.primaryEstablishmentName.toLowerCase();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      },
      licenceNumber: (a: GdxMociResponse, b: GdxMociResponse, dir: SortEvent): number => {
        const value1 = !CommonUtils.isValidValue(a) ? '' : a.commerciallicenseNumber.toLowerCase(),
          value2 = !CommonUtils.isValidValue(b) ? '' : b.commerciallicenseNumber.toLowerCase();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      },
      companyStatus: (a: GdxMociResponse, b: GdxMociResponse, dir: SortEvent): number => {
        const value1 = !CommonUtils.isValidValue(a) ? '' : a.crnStatus.toLowerCase(),
          value2 = !CommonUtils.isValidValue(b) ? '' : b.crnStatus.toLowerCase();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      },
      relation: (a: GdxMociResponse, b: GdxMociResponse, dir: SortEvent): number => {
        const value1 = !CommonUtils.isValidValue(a) ? '' : a.ownerType.toLowerCase(),
          value2 = !CommonUtils.isValidValue(b) ? '' : b.ownerType.toLowerCase();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      },
      relationStatus: (a: GdxMociResponse, b: GdxMociResponse, dir: SortEvent): number => {
        const value1 = !CommonUtils.isValidValue(a) ? '' : a.ownerStatus.toLowerCase(),
          value2 = !CommonUtils.isValidValue(b) ? '' : b.ownerStatus.toLowerCase();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      },
    }
  };
  actionsMap: any = {};
  selectedRecordMap: any = {
    moj: null,
    moci: null
  };

  getBeneficiaryQID(beneficiary: Beneficiary): string {
    if (!beneficiary) {
      return '';
    }
    if (beneficiary.benPrimaryIdType === BeneficiaryIdTypes.QID) {
      return beneficiary.benPrimaryIdNumber;
    } else if (beneficiary.benSecIdNumber && Number(beneficiary.benSecIdType) === BeneficiaryIdTypes.QID) {
      return beneficiary.benSecIdNumber;
    } else {
      return '';
    }
  }

  onTabChange($event: TabComponent) {
    const selectedTab = this._findTab('tabName', $event.name);
    if (!selectedTab) {
      return;
    }
    if (!selectedTab.isLoaded) {
      this.loadGDXIntegrationData(selectedTab.serviceId, true);
    }
  }

  loadGDXIntegrationData(serviceId: string, userInteraction: boolean = false) {
    if (!this.getBeneficiaryQID(this.beneficiary!)) {
      return;
    }
    const criteria = this._getGDXCriteria(this.beneficiary, serviceId);
    criteria.orgUserId = this.employeeService.getUser()?.id;
    this.beneficiaryService.loadGDXIntegrationData(criteria)
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          if (userInteraction) {
            const selectedTab = this._findTab('serviceId', serviceId);
            selectedTab ? selectedTab.isLoaded = true : null;
          }
        })
      )
      .subscribe((result) => {
        this._setResult(result, serviceId);
        this._resetRelatedData(serviceId);
      });
  }

  selectLog(log: GdxServiceLog): void {
    switch (log.gdxServiceId) {
      case GdxServicesEnum.MOJ:
        this.mojRelatedData = log.gdxServiceResponseParsed;
        this.selectedRecordMap.moj = log;
        break;
      case GdxServicesEnum.MOCI:
        this.mociRelatedDataList = log.gdxServiceResponseList;
        this.selectedRecordMap.moci = log;
        break;
      default:
        break;
    }
  }

  private _findTab(findBy: 'tabName' | 'serviceId', value: string): ITabData | undefined {
    return Object.values(this.tabData).find(tab => {
      if (findBy === 'tabName') {
        return tab.name === value;
      } else if (findBy === 'serviceId') {
        return tab.serviceId === value;
      }
      return undefined;
    });
  }

  private _setResult(response: GdxServiceLog[], serviceId: string) {
    switch (serviceId) {
      case GdxServicesEnum.MOJ:
        this.mojLogs = response;
        break;
      case GdxServicesEnum.MOCI:
        this.mociLogs = response;
        break;
      default:
        break;
    }
  }

  private _getGDXCriteria(beneficiary: Beneficiary, gdxServiceId: string): IGdxCriteria {
    return {
      qId: this.getBeneficiaryQID(beneficiary),
      gdxServiceId: gdxServiceId,
      benId: beneficiary.id
    };
  }

  private listenToAddIntegrationInquiries() {
    this._listenToAddInquiriesMOJ();
    this._listenToAddInquiriesMOCI();
  }

  private listenToReloadIntegrationInquiries() {
    this._listenToReloadGDXServiceData();
  }

  private _listenToAddInquiriesMOJ(): void {
    this.addMOJ$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => {
        return this.beneficiaryService.addMOJInquiry(this._getGDXCriteria(this.beneficiary!, GdxServicesEnum.MOJ));
      }))
      .subscribe((result) => {
        this.toast.success(this.langService.map.msg_added_successfully);
        this.loadGDXIntegrationData(GdxServicesEnum.MOJ);
      });
  }

  private _listenToAddInquiriesMOCI(): void {
    this.addMOCI$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => {
        return this.beneficiaryService.addMOCIInquiry(this._getGDXCriteria(this.beneficiary!, GdxServicesEnum.MOCI));
      }))
      .subscribe((result) => {
        this.toast.success(this.langService.map.msg_added_successfully);
        this.loadGDXIntegrationData(GdxServicesEnum.MOCI);
      });
  }

  private _listenToReloadGDXServiceData(): void {
    this.reloadMOJ$.pipe(
      takeUntil(this.destroy$),
      filter(val => val !== 'init')
    ).subscribe(() => this.loadGDXIntegrationData(GdxServicesEnum.MOJ));

    this.reloadMOCI$.pipe(
      takeUntil(this.destroy$),
      filter(val => val !== 'init')
    ).subscribe(() => this.loadGDXIntegrationData(GdxServicesEnum.MOCI));
  }

  private _buildIntegrationActions() {
    this.actionsMap.gdxServiceLog = [];
    this.actionsMap.mojRelatedFlats = [];
    this.actionsMap.mojRelatedParcels = [];
    this.actionsMap.mociRelatedCompanies = [];
  }

  private _resetRelatedData(serviceId: string) {
    switch (serviceId + '') {
      case GdxServicesEnum.MOPH:
        this.mojRelatedData = {flatInfoList: [], parcelInfoList: []};
        break;
      case GdxServicesEnum.MOCI:
        this.mociRelatedDataList = [];
        break;
      default:
        break;
    }
  }
}
