import {Component, Input, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {Beneficiary} from '@app/models/beneficiary';
import {GdxServicesEnum} from '@app/enums/gdx-services.enum';
import {GdxServiceRelatedTypesEnum} from '@app/enums/gdx-service-related-types.enum';
import {GdxServiceLog} from '@app/models/gdx-service-log';
import {LangService} from '@services/lang.service';
import {TabMap} from '@app/types/types';
import {GdxGarsiaPensionResponse} from '@app/models/gdx-garsia-pension-response';
import {IGdxServiceRelatedData} from '@contracts/i-gdx-service-related-data';
import {CommonUtils} from '@helpers/common-utils';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {ITabData} from '@contracts/i-tab-data';
import {
  IntegrationInquiryLogListComponent
} from '@app/modules/gdx-integration/integration-inquiry-log-list/integration-inquiry-log-list.component';
import {
  GarsiaPensionPaymentListComponent
} from '@app/modules/gdx-integration/related-data/garsia-pension-payment-list/garsia-pension-payment-list.component';
import {GarsiaPensionListComponent} from '@app/modules/gdx-integration/related-data/garsia-pension-list/garsia-pension-list.component';

@Component({
  selector: 'integration-inquiries',
  templateUrl: './integration-inquiries.component.html',
  styleUrls: ['./integration-inquiries.component.scss']
})
export class IntegrationInquiriesComponent {
  @Input('beneficiary') beneficiary!: Beneficiary;

  constructor(public lang: LangService) {
  }

  private logListComponentsMap: Map<GdxServicesEnum, any> = new Map<GdxServicesEnum, any>();

  @ViewChild('garsiaPensionList') garsiaPensionListComponentRef!: GarsiaPensionListComponent;
  @ViewChild('garsiaPaymentList') garsiaPaymentListComponentRef!: GarsiaPensionPaymentListComponent;

  gdxServicesEnum = GdxServicesEnum;
  gdxServiceRelatedTypesEnum = GdxServiceRelatedTypesEnum;
  selectedLog: { [key in GdxServicesEnum]?: GdxServiceLog | undefined } = {};
  selectedService: GdxServicesEnum = GdxServicesEnum.MOJ;
  tabsData: TabMap = {
    moj: {
      name: 'moj',
      index: 0,
      langKey: 'integration_moj',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      serviceId: GdxServicesEnum.MOJ,
      isLoaded: false
    },
    moci: {
      name: 'moci',
      index: 1,
      langKey: 'integration_moci',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      serviceId: GdxServicesEnum.MOCI,
      isLoaded: false
    },
    mawared: {
      name: 'mawared',
      index: 2,
      langKey: 'integration_mawared',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      serviceId: GdxServicesEnum.MAWARED,
      isLoaded: false
    },
    garsia: {
      name: 'garsia',
      index: 3,
      langKey: 'integration_garsia',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      serviceId: GdxServicesEnum.GARSIA,
      isLoaded: false
    },
    izzab: {
      name: 'izzab',
      index: 4,
      langKey: 'integration_izzab',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      serviceId: GdxServicesEnum.IZZAB,
      isLoaded: false
    },
    kahramaa: {
      name: 'kahramaa',
      index: 5,
      langKey: 'integration_kahramaa',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      serviceId: GdxServicesEnum.KAHRAMAA,
      isLoaded: false
    },
    qatarCharity: {
      name: 'qatarCharity',
      index: 6,
      langKey: 'integration_qatar_charity',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      // serviceId: GdxServicesEnum.QATAR_CHARITY,
      isLoaded: true
    },
  };
  tabIndex$: Subject<number> = new Subject<number>();

  relatedData: IGdxServiceRelatedData = {
    [GdxServiceRelatedTypesEnum.MOJ_FLATS]: [],
    [GdxServiceRelatedTypesEnum.MOJ_PARCELS]: [],
    [GdxServiceRelatedTypesEnum.MOCI_COMPANIES]: [],
    [GdxServiceRelatedTypesEnum.MAWARED_EMPLOYEES]: [],
    [GdxServiceRelatedTypesEnum.GARSIA_PENSION]: [],
    [GdxServiceRelatedTypesEnum.GARSIA_PENSION_PAYMENT]: [],
    [GdxServiceRelatedTypesEnum.KAHRAMAA_OUTSTANDING_PAYMENTS]: []
  };

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
        this.relatedData[GdxServiceRelatedTypesEnum.MAWARED_EMPLOYEES] = [log.gdxServiceResponseParsed];
        break;
      case GdxServicesEnum.GARSIA:
        this.relatedData[GdxServiceRelatedTypesEnum.GARSIA_PENSION] = [log.gdxServiceResponseParsed];
        this.garsiaPensionListComponentRef?.setSelectedPension(undefined);
        break;
      case GdxServicesEnum.KAHRAMAA:
        this.relatedData[GdxServiceRelatedTypesEnum.KAHRAMAA_OUTSTANDING_PAYMENTS] = log.gdxServiceResponseList;
        console.log(log.gdxServiceResponseList);
        break;
      default:
        break;
    }
  }

  setLookupComponentMap(serviceId: GdxServicesEnum, componentRef: IntegrationInquiryLogListComponent) {
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

  setPensionPayment(pensionRecord?: GdxGarsiaPensionResponse) {
    this.garsiaPaymentListComponentRef.paginator.goToControl.setValue(1);
    this.relatedData[GdxServiceRelatedTypesEnum.GARSIA_PENSION_PAYMENT] = pensionRecord?.pensionMonthlyPayments || [];
  }

  private _getServiceComponent(serviceId: GdxServicesEnum): IntegrationInquiryLogListComponent {
    return this.logListComponentsMap.get(serviceId);
  }

  private _resetSelectedLog(serviceId: GdxServicesEnum) {
    this.selectedLog = {};
    const currentListComponent = this._getServiceComponent(serviceId);
    if (currentListComponent) {
      currentListComponent.selectedRecord = undefined;
    }
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
        this.relatedData[GdxServiceRelatedTypesEnum.MAWARED_EMPLOYEES] = [];
        break;
      case GdxServicesEnum.GARSIA:
        this.relatedData[GdxServiceRelatedTypesEnum.GARSIA_PENSION] = [];
        this.relatedData[GdxServiceRelatedTypesEnum.GARSIA_PENSION_PAYMENT] = [];
        this.garsiaPensionListComponentRef?.setSelectedPension(undefined);
        break;
      case GdxServicesEnum.KAHRAMAA:
        this.relatedData[GdxServiceRelatedTypesEnum.KAHRAMAA_OUTSTANDING_PAYMENTS] = [];
        break;
      default:
        break;
    }
  }

  private _findTab(findBy: 'tabName' | 'serviceId', value: string): ITabData | undefined {
    return Object.values(this.tabsData).find(tab => {
      if (findBy === 'tabName') {
        return tab.name === value;
      } else if (findBy === 'serviceId') {
        return tab.serviceId === value;
      }
      return undefined;
    });
  }
}
