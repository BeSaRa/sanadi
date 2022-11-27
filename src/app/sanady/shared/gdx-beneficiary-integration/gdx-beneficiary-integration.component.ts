import {Component, Input, OnDestroy, ViewChild} from '@angular/core';
import {GdxServicesEnum} from '@app/enums/gdx-services.enum';
import {GdxServiceLog} from '@app/models/gdx-service-log';
import {TabMap} from '@app/types/types';
import {Subject} from 'rxjs';
import {GdxMociResponse} from '@app/models/gdx-moci-response';
import {UntypedFormControl} from '@angular/forms';
import {SortEvent} from '@contracts/sort-event';
import {CommonUtils} from '@helpers/common-utils';
import {LangService} from '@services/lang.service';
import {ITabData} from '@contracts/i-tab-data';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {Beneficiary} from '@app/models/beneficiary';
import {GdxGarsiaPensionResponse} from '@app/models/gdx-garsia-pension-response';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {CustomValidators} from '@app/validators/custom-validators';
import {PaginatorComponent} from '@app/shared/components/paginator/paginator.component';
import {
  GdxIntegrationInquiryLogListComponent
} from '@app/sanady/shared/gdx-integration-inquiry-log-list/gdx-integration-inquiry-log-list.component';
import {GdxServiceRelatedTypesEnum} from '@app/enums/gdx-service-related-types.enum';
import {IGdxServiceRelatedData} from '@contracts/i-gdx-service-related-data';

@Component({
  selector: 'gdx-beneficiary-integration',
  templateUrl: './gdx-beneficiary-integration.component.html',
  styleUrls: ['./gdx-beneficiary-integration.component.scss']
})
export class GdxBeneficiaryIntegrationComponent implements OnDestroy {
  private destroy$: Subject<any> = new Subject<any>();
  @Input('beneficiary') beneficiary!: Beneficiary;

  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  gdxServicesEnum = GdxServicesEnum;
  gdxServiceRelatedTypesEnum = GdxServiceRelatedTypesEnum;
  logListComponentsMap: Map<GdxServicesEnum, any> = new Map<GdxServicesEnum, any>();
  selectedLog: { [key in GdxServicesEnum]?: GdxServiceLog | undefined } = {};
  selectedService: GdxServicesEnum = GdxServicesEnum.MOJ;

  constructor(public lang: LangService) {
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
    izzab: {
      name: 'izzab',
      index: 4,
      langKey: 'integration_izzab',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      serviceId: GdxServicesEnum.IZZAB + '',
      isLoaded: false
    },
    kahramaa: {
      name: 'kahramaa',
      index: 5,
      langKey: 'integration_kahramaa',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      serviceId: GdxServicesEnum.KAHRAMAA + '',
      isLoaded: false
    },
    qatarCharity: {
      name: 'qatarCharity',
      index: 6,
      langKey: 'integration_qatar_charity',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      // serviceId: GdxServicesEnum.QATAR_CHARITY + '',
      isLoaded: true
    },
  };
  tabIndex$: Subject<number> = new Subject<number>();

  headerColumn: string[] = ['extra-header'];

  selectedGarsiaPension?: GdxGarsiaPensionResponse;
  @ViewChild('garsiaPensionPaymentPaginator') pensionPaymentsPaginator!: PaginatorComponent;

  relatedData: IGdxServiceRelatedData = {
    [GdxServiceRelatedTypesEnum.MOJ_FLATS]: [],
    [GdxServiceRelatedTypesEnum.MOJ_PARCELS]: [],
    [GdxServiceRelatedTypesEnum.MOCI_COMPANIES]: [],
    [GdxServiceRelatedTypesEnum.MAWARED_RELATED]: [],
    [GdxServiceRelatedTypesEnum.GARSIA_PENSION]: [],
    [GdxServiceRelatedTypesEnum.GARSIA_PENSION_PAYMENT]: [],
    [GdxServiceRelatedTypesEnum.KAHRAMAA_RELATED]: []
  }

  displayColumnsMap: { [key in GdxServiceRelatedTypesEnum]: string[] } = {
    [GdxServiceRelatedTypesEnum.MOJ_FLATS]: ['transactionNo', 'transactionType', 'ownerName', 'contractDate', 'ownerShares'],
    [GdxServiceRelatedTypesEnum.MOJ_PARCELS]: ['parcelNo', 'parcelType', 'ownerName', 'city', 'zone', 'sharesCount'],
    [GdxServiceRelatedTypesEnum.MOCI_COMPANIES]: ['companyName', 'licenceNumber', 'companyStatus', 'relation', 'relationStatus'],
    [GdxServiceRelatedTypesEnum.MAWARED_RELATED]: ['empNameAr', 'empNameEn', 'empQID', 'entityName', 'entityId', 'firstMonth', 'firstPayment', 'secondMonth', 'secondPayment', 'thirdMonth', 'thirdPayment'],
    [GdxServiceRelatedTypesEnum.GARSIA_PENSION]: ['pensionArName', 'pensionEmployer', 'pensionStatus', 'firstJoinDate',
      'endOfServiceDate', 'finalServicePeriodYears', 'finalServicePeriodMonths', 'finalServicePeriodDays', 'pensionDeserveDate', 'totalPensionDeserved', 'actions'],
    [GdxServiceRelatedTypesEnum.GARSIA_PENSION_PAYMENT]: ['payAccountNum', 'payMonth', 'payYear', 'payValue'],
    [GdxServiceRelatedTypesEnum.IZZAB_RELATED]: [],
    [GdxServiceRelatedTypesEnum.KAHRAMAA_RELATED]: ['amount', 'fees', 'fine']
  };

  filterControlsMap: { [key in GdxServiceRelatedTypesEnum]: UntypedFormControl } = {
    [GdxServiceRelatedTypesEnum.MOJ_FLATS]: new UntypedFormControl(''),
    [GdxServiceRelatedTypesEnum.MOJ_PARCELS]: new UntypedFormControl(''),
    [GdxServiceRelatedTypesEnum.MOCI_COMPANIES]: new UntypedFormControl(''),
    [GdxServiceRelatedTypesEnum.MAWARED_RELATED]: new UntypedFormControl(''),
    [GdxServiceRelatedTypesEnum.GARSIA_PENSION]: new UntypedFormControl(''),
    [GdxServiceRelatedTypesEnum.GARSIA_PENSION_PAYMENT]: new UntypedFormControl(''),
    [GdxServiceRelatedTypesEnum.IZZAB_RELATED]: new UntypedFormControl(''),
    [GdxServiceRelatedTypesEnum.KAHRAMAA_RELATED]: new UntypedFormControl(''),
  };

  sortingCallbacksMap: { [key in GdxServiceRelatedTypesEnum]?: any } = {
    [GdxServiceRelatedTypesEnum.MOCI_COMPANIES]: {
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

  actionsMap: { [key in GdxServiceRelatedTypesEnum]: IMenuItem<any>[] } = {
    [GdxServiceRelatedTypesEnum.MOJ_FLATS]: [],
    [GdxServiceRelatedTypesEnum.MOJ_PARCELS]: [],
    [GdxServiceRelatedTypesEnum.MOCI_COMPANIES]: [],
    [GdxServiceRelatedTypesEnum.MAWARED_RELATED]: [],
    [GdxServiceRelatedTypesEnum.GARSIA_PENSION]: [
      // payments
      {
        type: 'action',
        label: 'payments',
        show: () => true,
        onClick: (item: GdxGarsiaPensionResponse) => {
          this.selectedGarsiaPension = item;
          this.relatedData[GdxServiceRelatedTypesEnum.GARSIA_PENSION_PAYMENT] = item.pensionMonthlyPayments;
          this.pensionPaymentsPaginator.goToControl.setValue(1);
        }
      }
    ],
    [GdxServiceRelatedTypesEnum.GARSIA_PENSION_PAYMENT]: [],
    [GdxServiceRelatedTypesEnum.IZZAB_RELATED]: [],
    [GdxServiceRelatedTypesEnum.KAHRAMAA_RELATED]: []
  };

  private _getServiceComponent(serviceId: GdxServicesEnum): GdxIntegrationInquiryLogListComponent {
    return this.logListComponentsMap.get(serviceId);
  }

  private _resetSelectedLog(serviceId: GdxServicesEnum) {
    this.selectedLog = {};
    const currentListComponent = this._getServiceComponent(serviceId);
    if (currentListComponent) {
      currentListComponent.selectedRecord = undefined;
    }
  }

  onTabChange($event: TabComponent) {
    const selectedTab = this._findTab('tabName', $event.name);
    if (!selectedTab || selectedTab.isLoaded) {
      return;
    }
    let listComponent = this._getServiceComponent(selectedTab.serviceId);
    if (!listComponent) {
      return;
    }
    this.selectedService = selectedTab.serviceId;
    listComponent?.reload$.next(null);
  }

  selectLog(log: GdxServiceLog): void {
    this.selectedLog[log.gdxServiceId as GdxServicesEnum] = log;
    switch (log.gdxServiceId) {
      case GdxServicesEnum.MOJ:
        this.relatedData[GdxServiceRelatedTypesEnum.MOJ_FLATS] = log.gdxServiceResponseParsed.flatInfoList;
        this.relatedData[GdxServiceRelatedTypesEnum.MOJ_PARCELS] = log.gdxServiceResponseParsed.parcelInfoList;
        break;
      case GdxServicesEnum.MOCI:
        this.relatedData[GdxServiceRelatedTypesEnum.MOCI_COMPANIES] = log.gdxServiceResponseList;
        break;
      case GdxServicesEnum.MAWARED:
        this.relatedData[GdxServiceRelatedTypesEnum.MAWARED_RELATED] = [log.gdxServiceResponseParsed];
        break;
      case GdxServicesEnum.GARSIA:
        this.relatedData[GdxServiceRelatedTypesEnum.GARSIA_PENSION] = [log.gdxServiceResponseParsed];
        this.relatedData[GdxServiceRelatedTypesEnum.GARSIA_PENSION_PAYMENT] = [];
        this.selectedGarsiaPension = undefined;
        break;
      case GdxServicesEnum.KAHRAMAA:
        this.relatedData[GdxServiceRelatedTypesEnum.KAHRAMAA_RELATED] = log.gdxServiceResponseList;
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

  setLookupComponentMap(serviceId: GdxServicesEnum, componentRef: GdxIntegrationInquiryLogListComponent) {
    if (!CommonUtils.isValidValue(serviceId)) {
      return;
    }
    this.logListComponentsMap.set(serviceId, componentRef);
    if (serviceId === GdxServicesEnum.MOJ) {
      componentRef.reload$.next(null); // load the first tab manually
    }
  }

  loadRecordsDone(serviceId: GdxServicesEnum) {
    this._resetRelatedData(serviceId);
    const selectedTab = this._findTab('serviceId', serviceId);
    selectedTab ? selectedTab.isLoaded = true : null;
  }

  private _resetRelatedData(serviceId: GdxServicesEnum) {
    this._resetSelectedLog(serviceId);
    switch (serviceId) {
      case GdxServicesEnum.MOJ:
        this.relatedData[GdxServiceRelatedTypesEnum.MOJ_FLATS] = [];
        this.relatedData[GdxServiceRelatedTypesEnum.MOJ_PARCELS] = [];
        break;
      case GdxServicesEnum.MOCI:
        this.relatedData[GdxServiceRelatedTypesEnum.MOCI_COMPANIES] = [];
        break;
      case GdxServicesEnum.MAWARED:
        this.relatedData[GdxServiceRelatedTypesEnum.MAWARED_RELATED] = [];
        break;
      case GdxServicesEnum.GARSIA:
        this.relatedData[GdxServiceRelatedTypesEnum.GARSIA_PENSION] = [];
        this.relatedData[GdxServiceRelatedTypesEnum.GARSIA_PENSION_PAYMENT] = [];
        this.selectedGarsiaPension = undefined;
        break;
      case GdxServicesEnum.KAHRAMAA:
        this.relatedData[GdxServiceRelatedTypesEnum.KAHRAMAA_RELATED] = [];
        break;
      default:
        break;
    }
  }
}
