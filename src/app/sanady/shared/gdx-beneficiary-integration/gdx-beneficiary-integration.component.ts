import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {exhaustMap, filter, takeUntil, tap} from 'rxjs/operators';
import {GdxServicesEnum} from '@app/enums/gdx-services.enum';
import {GdxServiceLog} from '@app/models/gdx-service-log';
import {TabMap} from '@app/types/types';
import {BehaviorSubject, Subject} from 'rxjs';
import {GdxMojResponse} from '@app/models/gdx-moj-response';
import {GdxMociResponse} from '@app/models/gdx-moci-response';
import {UntypedFormControl} from '@angular/forms';
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
import {GdxGarsiaPensionResponse} from '@app/models/gdx-garsia-pension-response';
import {GdxMawaredResponse} from '@app/models/gdx-mawared-response';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {GdxPensionMonthPayment} from '@app/models/gdx-pension-month-payment';
import {CustomValidators} from '@app/validators/custom-validators';
import {TableComponent} from '@app/shared/components/table/table.component';
import {PaginatorComponent} from '@app/shared/components/paginator/paginator.component';

@Component({
  selector: 'gdx-beneficiary-integration',
  templateUrl: './gdx-beneficiary-integration.component.html',
  styleUrls: ['./gdx-beneficiary-integration.component.scss']
})
export class GdxBeneficiaryIntegrationComponent implements OnInit, OnDestroy {
  private destroy$: Subject<any> = new Subject<any>();
  @Input('beneficiary') beneficiary!: Beneficiary;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

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
    mawared: {
      name: 'mawared',
      index: 2,
      langKey: 'integration_mawared',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      serviceId: GdxServicesEnum.MAWARED + '',
      isLoaded: false
    },
    garsia: {
      name: 'garsia',
      index: 3,
      langKey: 'integration_garsia',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      serviceId: GdxServicesEnum.GARSIA + '',
      isLoaded: false
    },
    qatarCharity: {
      name: 'qatarCharity',
      index: 4,
      langKey: 'integration_qatar_charity',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      // serviceId: GdxServicesEnum.QATAR_CHARITY + '',
      isLoaded: true
    },
  };
  tabIndex$: Subject<number> = new Subject<number>();

  headerColumn: string[] = ['extra-header'];

  mojLogs: GdxServiceLog[] = [];
  mojRelatedData: GdxMojResponse = {flatInfoList: [], parcelInfoList: []};

  mociLogs: GdxServiceLog[] = [];
  mociRelatedDataList: GdxMociResponse[] = [];

  mawaredLogs: GdxServiceLog[] = [];
  mawaredRelatedDataList: GdxMawaredResponse[] = [];

  garsiaLogs: GdxServiceLog[] = [];
  garsiaRelatedDataList: GdxGarsiaPensionResponse[] = [];
  selectedGarsiaPension?: GdxGarsiaPensionResponse;
  selectedGarsiaPensionList: GdxPensionMonthPayment[] = [];
  @ViewChild('garsiaPensionPaymentPaginator') pensionPaymentsPaginator!: PaginatorComponent;

  addMOJ$: Subject<any> = new Subject<any>();
  reloadMOJ$: BehaviorSubject<any> = new BehaviorSubject<any>('init');

  addMOCI$: Subject<any> = new Subject<any>();
  reloadMOCI$: BehaviorSubject<any> = new BehaviorSubject<any>('init');

  addMawared$: Subject<any> = new Subject<any>();
  reloadMawared$: BehaviorSubject<any> = new BehaviorSubject<any>('init');

  addGarsia$: Subject<any> = new Subject<any>();
  reloadGarsia$: BehaviorSubject<any> = new BehaviorSubject<any>('init');

  displayColumnsMap: any = {
    gdxServiceLog: ['organization', 'user', 'actionTime', 'actions'],
    mojRelatedFlats: ['transactionNo', 'transactionType', 'ownerName', 'contractDate', 'ownerShares'],
    mojRelatedParcels: ['parcelNo', 'parcelType', 'ownerName', 'city', 'zone', 'sharesCount'],
    mociRelatedCompanies: ['companyName', 'licenceNumber', 'companyStatus', 'relation', 'relationStatus'],
    mawaredRelatedData: ['empNameAr', 'empNameEn', 'empQID', 'entityName', 'entityId', 'firstMonth', 'firstPayment', 'secondMonth', 'secondPayment', 'thirdMonth', 'thirdPayment'],
    garsiaRelatedPensions: ['pensionArName', 'pensionEmployer', 'pensionStatus', 'firstJoinDate',
      'endOfServiceDate', 'finalServicePeriodYears', 'finalServicePeriodMonths', 'finalServicePeriodDays', 'pensionDeserveDate', 'totalPensionDeserved', 'actions'],
    garsiaRelatedPensionPayments: ['payAccountNum', 'payMonth', 'payYear', 'payValue']
  };
  filterControlsMap: { [key: string]: UntypedFormControl } = {
    moj: new UntypedFormControl(''),
    mojRelatedFlats: new UntypedFormControl(''),
    mojRelatedParcels: new UntypedFormControl(''),
    moci: new UntypedFormControl(''),
    mociRelatedCompanies: new UntypedFormControl(''),
    mawared: new UntypedFormControl(''),
    mawaredRelatedData: new UntypedFormControl(''),
    garsia: new UntypedFormControl(''),
    garsiaRelatedPensions: new UntypedFormControl(''),
    garsiaRelatedPensionPayments: new UntypedFormControl(''),
  };
  sortingCallbacksMap = {
    gdxServiceLog: {
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
    },
    garsiaRelatedPensions: {}
  };
  actionsMap: { [key: string]: IMenuItem<any>[] } = {};
  selectedRecordMap: any = {
    moj: null,
    moci: null,
    mawared: null,
    garsia: null
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
    criteria.orgUserId = this.employeeService.getExternalUser()?.id;
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
      case GdxServicesEnum.MAWARED:
        this.mawaredRelatedDataList = [log.gdxServiceResponseParsed];
        this.selectedRecordMap.mawared = log;
        break;
      case GdxServicesEnum.GARSIA:
        this.garsiaRelatedDataList = [log.gdxServiceResponseParsed];
        this.selectedRecordMap.garsia = log;
        this.selectedGarsiaPension = undefined;
        this.selectedGarsiaPensionList = [];
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
      case GdxServicesEnum.MAWARED:
        this.mawaredLogs = response;
        break;
      case GdxServicesEnum.GARSIA:
        this.garsiaLogs = response;
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
    this._listenToAddInquiriesMAWARED();
    this._listenToAddInquiriesGARSIA();
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
      .subscribe(() => {
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
      .subscribe(() => {
        this.toast.success(this.langService.map.msg_added_successfully);
        this.loadGDXIntegrationData(GdxServicesEnum.MOCI);
      });
  }

  private _listenToAddInquiriesMAWARED(): void {
    this.addMawared$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => {
        return this.beneficiaryService.addMAWAREDInquiry(this._getGDXCriteria(this.beneficiary!, GdxServicesEnum.MAWARED));
      }))
      .subscribe(() => {
        this.toast.success(this.langService.map.msg_added_successfully);
        this.loadGDXIntegrationData(GdxServicesEnum.MAWARED);
      });
  }

  private _listenToAddInquiriesGARSIA(): void {
    this.addGarsia$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => {
        return this.beneficiaryService.addGarsiaInquiry(this._getGDXCriteria(this.beneficiary!, GdxServicesEnum.GARSIA));
      }))
      .subscribe(() => {
        this.toast.success(this.langService.map.msg_added_successfully);
        this.loadGDXIntegrationData(GdxServicesEnum.GARSIA);
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

    this.reloadMawared$.pipe(
      takeUntil(this.destroy$),
      filter(val => val !== 'init')
    ).subscribe(() => this.loadGDXIntegrationData(GdxServicesEnum.MAWARED));

    this.reloadGarsia$.pipe(
      takeUntil(this.destroy$),
      filter(val => val !== 'init')
    ).subscribe(() => this.loadGDXIntegrationData(GdxServicesEnum.GARSIA));
  }

  private _buildIntegrationActions() {
    this.actionsMap.gdxServiceLog = [];
    this.actionsMap.mojRelatedFlats = [];
    this.actionsMap.mojRelatedParcels = [];
    this.actionsMap.mociRelatedCompanies = [];
    this.actionsMap.mawaredRelatedData = [];
    this.actionsMap.garsiaRelatedPensions = [{
      type: 'action',
      label: 'payments',
      show: () => true,
      onClick: (item: GdxGarsiaPensionResponse) => {
        this.selectedGarsiaPension = item;
        this.selectedGarsiaPensionList = item.pensionMonthlyPayments;
        this.pensionPaymentsPaginator.goToControl.setValue(1);
      }
    }];
    this.actionsMap.garsiaPensionPayments = [];
  }

  private _resetRelatedData(serviceId: string) {
    switch (serviceId + '') {
      case GdxServicesEnum.MOPH:
        this.mojRelatedData = {flatInfoList: [], parcelInfoList: []};
        break;
      case GdxServicesEnum.MOCI:
        this.mociRelatedDataList = [];
        break;
      case GdxServicesEnum.MAWARED:
        this.mawaredRelatedDataList = [];
        break;
      case GdxServicesEnum.GARSIA:
        this.garsiaRelatedDataList = [];
        this.selectedGarsiaPension = undefined;
        this.selectedGarsiaPensionList = [];
        break;
      default:
        break;
    }
  }
}
