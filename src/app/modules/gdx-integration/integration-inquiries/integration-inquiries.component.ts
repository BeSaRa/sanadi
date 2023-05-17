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
import {
  GarsiaPensionListComponent
} from '@app/modules/gdx-integration/related-data/garsia-pension-list/garsia-pension-list.component';
import {GdxMolPayrollResponse} from '@app/models/gdx-mol-payroll-response';
import {GdxMojResponse} from '@app/models/gdx-moj-response';
import {GdxMoeResponse} from '@app/models/gdx-moe-pending-installments';
import {MoeStudentInfoComponent} from '../related-data/moe-student-info/moe-student-info.component';
import {MoeInstallmentsComponent} from '../related-data/moe-installments/moe-installments.component';
import {MoePendingPaymentComponent} from '../related-data/moe-pending-payment/moe-pending-payment.component';

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

  @ViewChild('moeStudentInfoList') moeStudentInfoComponentRef!: MoeStudentInfoComponent;
  @ViewChild('moeInstallmentsList') moeInstallmentsComponentRef!: MoeInstallmentsComponent;
  @ViewChild('moePendingPaymentList') moePendingPaymentComponentRef!: MoePendingPaymentComponent;

  gdxServicesEnum = GdxServicesEnum;
  gdxServiceRelatedTypesEnum = GdxServiceRelatedTypesEnum;
  selectedLog: { [key in GdxServicesEnum]?: GdxServiceLog | undefined } = {};
  selectedService: GdxServicesEnum = GdxServicesEnum.MOJ;
  mainTabsData: TabMap = {
    governmentAgencies: {
      name: 'governmentAgencies',
      index: 0,
      langKey: 'government_agencies',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      isLoaded: true
    },
    charitableEntities: {
      name: 'charitableEntities',
      index: 1,
      langKey: 'charitable_entities',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      isLoaded: true
    }
  }
  govTabsData: TabMap = {
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
    izzab: {
      name: 'izzab',
      index: 2,
      langKey: 'integration_izzab',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      serviceId: GdxServicesEnum.IZZAB,
      isLoaded: false
    },
    mme: {
      name: 'mme',
      index: 3,
      langKey: 'integration_mme',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      serviceId: GdxServicesEnum.MME,
      isLoaded: false
    },
    mol: {
      name: 'mol',
      index: 4,
      langKey: 'integration_mol',
      show: () => false,
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      serviceId: GdxServicesEnum.MOL,
      isLoaded: false
    },
    moe: {
      name: 'moe',
      index: 5,
      langKey: 'integration_moe',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      serviceId: GdxServicesEnum.MOE,
      isLoaded: false
    },
    mawared: {
      name: 'mawared',
      index: 6,
      langKey: 'integration_mawared',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      serviceId: GdxServicesEnum.MAWARED,
      isLoaded: false
    },
    garsia: {
      name: 'garsia',
      index: 7,
      langKey: 'integration_garsia',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      serviceId: GdxServicesEnum.GARSIA,
      isLoaded: false
    },
    kahramaa: {
      name: 'kahramaa',
      index: 8,
      langKey: 'integration_kahramaa',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      serviceId: GdxServicesEnum.KAHRAMAA,
      isLoaded: false
    },
    sjc: {
      name: 'sjc',
      index: 9,
      langKey: 'integration_sjc',
      show: () => true,
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      serviceId: GdxServicesEnum.SJC,
      isLoaded: false
    },
  };
  charityTabsData: TabMap = {
    qatarZakatFund: {
      name: 'qatarZakatFund',
      index: 0,
      langKey: 'integration_qatar_zakat_fund',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      // serviceId: GdxServicesEnum.QATAR_ZAKAT_FUND,
      isLoaded: true
    },
    qatarCharity: {
      name: 'qatarCharity',
      index: 1,
      langKey: 'integration_qatar_charity',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      // serviceId: GdxServicesEnum.QATAR_CHARITY,
      isLoaded: true
    },
    qrcs: {
      name: 'qrcs',
      index: 2,
      langKey: 'integration_qrcs',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      // serviceId: GdxServicesEnum.QRCS,
      isLoaded: true
    },
    qatarCancerSociety: {
      name: 'qatarCancerSociety',
      index: 3,
      langKey: 'integration_qatar_cancer_society',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      // serviceId: GdxServicesEnum.QATAR_CANCER_SOCIETY,
      isLoaded: true
    },
    alSheikhEidCharitableFoundation: {
      name: 'alSheikhEidCharitableFoundation',
      index: 4,
      langKey: 'integration_al_sheikh_eid_charitable_foundation',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      // serviceId: GdxServicesEnum.AL_SHEIKH_EID_CHARITABLE_FOUNDATION,
      isLoaded: true
    },
    alAsmakhCharitableFoundation: {
      name: 'alAsmakhCharitableFoundation',
      index: 5,
      langKey: 'integration_al_asmakh_charitable_foundation',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      // serviceId: GdxServicesEnum.AL_ASMAKH_CHARITABLE_FOUNDATION,
      isLoaded: true
    },
    jasimHamadBinJasimCharityFund: {
      name: 'jasimHamadBinJasimCharityFund',
      index: 6,
      langKey: 'integration_jasim_hamad_bin_jasim_charity_fund',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      // serviceId: GdxServicesEnum.JASIM_HAMAD_BIN_JASIM_CHARITY,
      isLoaded: true
    },
    qsrn: {
      name: 'qsrn',
      index: 7,
      langKey: 'integration_qsrn',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      // serviceId: GdxServicesEnum.QSRN,
      isLoaded: true
    },
  }
  mainTabIndex$: Subject<number> = new Subject<number>();
  govTabIndex$: Subject<number> = new Subject<number>();
  charityTabIndex$: Subject<number> = new Subject<number>();

  relatedData: IGdxServiceRelatedData = {
    [GdxServiceRelatedTypesEnum.MOJ_FLATS]: [],
    [GdxServiceRelatedTypesEnum.MOJ_PARCELS]: [],
    [GdxServiceRelatedTypesEnum.MOCI_COMPANIES]: [],
    [GdxServiceRelatedTypesEnum.MAWARED_EMPLOYEES]: [],
    [GdxServiceRelatedTypesEnum.GARSIA_PENSION]: [],
    [GdxServiceRelatedTypesEnum.GARSIA_PENSION_PAYMENT]: [],
    [GdxServiceRelatedTypesEnum.KAHRAMAA_OUTSTANDING_PAYMENTS]: [],
    [GdxServiceRelatedTypesEnum.MOL_RELATED_DATA]: [],
    [GdxServiceRelatedTypesEnum.SJC_RELATED_DATA]: [],
    [GdxServiceRelatedTypesEnum.MOE_STUDENT_INFO]: [],
    [GdxServiceRelatedTypesEnum.MOE_INSTALLMENTS]: [],
    [GdxServiceRelatedTypesEnum.MOE_PENDING_PAYMENTS]: [],
    [GdxServiceRelatedTypesEnum.MME_LEASED_CONTRACT]: [],
  };

  onMainTabChange($event: TabComponent): void {

  }

  onGovTabChange($event: TabComponent) {
    const selectedTab = this._findTab(this.govTabsData, 'tabName', $event.name);
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

  onCharityTabChange($event: TabComponent): void {

  }

  selectLog(log: GdxServiceLog): void {
    this.selectedLog[log.gdxServiceId as GdxServicesEnum] = log;
    switch (log.gdxServiceId) {
      case GdxServicesEnum.MOJ:
        this.relatedData[GdxServiceRelatedTypesEnum.MOJ_FLATS] = (log.gdxServiceResponseParsed as GdxMojResponse).flatInfoList;
        this.relatedData[GdxServiceRelatedTypesEnum.MOJ_PARCELS] = (log.gdxServiceResponseParsed as GdxMojResponse).parcelInfoList;
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
        break;
      case GdxServicesEnum.MOL:
        this.relatedData[GdxServiceRelatedTypesEnum.MOL_RELATED_DATA] = (log.gdxServiceResponseParsed as GdxMolPayrollResponse).payRollList;
        break;
      case GdxServicesEnum.SJC:
        this.relatedData[GdxServiceRelatedTypesEnum.SJC_RELATED_DATA] = [log.gdxServiceResponseParsed];
        break;
      case GdxServicesEnum.MOE:
        this.relatedData[this.gdxServiceRelatedTypesEnum.MOE_STUDENT_INFO] = log.gdxServiceResponseList;
        this.moeStudentInfoComponentRef.setSelectedStudentInfo(undefined);
        break;
      case GdxServicesEnum.MME:
        // console.log(log)
        this.relatedData[this.gdxServiceRelatedTypesEnum.MME_LEASED_CONTRACT] = log.gdxServiceResponseList;
        // console.log(this.relatedData)
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

  loadRecordsDone(serviceId: GdxServicesEnum, tabsData: TabMap) {
    this._resetRelatedData(serviceId);
    const selectedTab = this._findTab(tabsData, 'serviceId', serviceId);
    selectedTab ? selectedTab.isLoaded = true : null;
  }

  setPensionPayment(pensionRecord?: GdxGarsiaPensionResponse) {
    this.garsiaPaymentListComponentRef.paginator.goToControl.setValue(1);
    this.relatedData[GdxServiceRelatedTypesEnum.GARSIA_PENSION_PAYMENT] = pensionRecord?.pensionMonthlyPayments || [];
  }

  setStudentInfo(studentRecord?: GdxMoeResponse) {
    this.moeInstallmentsComponentRef.paginator.goToControl.setValue(1);
    this.relatedData[GdxServiceRelatedTypesEnum.MOE_INSTALLMENTS] = studentRecord?.installments || [];

    this.moePendingPaymentComponentRef.paginator.goToControl.setValue(1);
    this.relatedData[GdxServiceRelatedTypesEnum.MOE_PENDING_PAYMENTS] = studentRecord?.privateSchoolPendingPayment || [];
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
      case GdxServicesEnum.MOL:
        this.relatedData[GdxServiceRelatedTypesEnum.MOL_RELATED_DATA] = [];
        break;
      case GdxServicesEnum.SJC:
        this.relatedData[GdxServiceRelatedTypesEnum.SJC_RELATED_DATA] = [];
        break;
      case GdxServicesEnum.MOE:
        this.relatedData[GdxServiceRelatedTypesEnum.MOE_INSTALLMENTS] = [];
        this.relatedData[GdxServiceRelatedTypesEnum.MOE_PENDING_PAYMENTS] = [];
        this.moeStudentInfoComponentRef?.setSelectedStudentInfo(undefined)
        break;
      case GdxServicesEnum.MME:
        this.relatedData[GdxServiceRelatedTypesEnum.MME_LEASED_CONTRACT] = [];
        break;
      default:
        break;
    }
  }

  private _findTab(tabsData: TabMap, findBy: 'tabName' | 'serviceId', value: string): ITabData | undefined {
    return Object.values(tabsData).find(tab => {
      if (findBy === 'tabName') {
        return tab.name === value;
      } else if (findBy === 'serviceId') {
        return tab.serviceId === value;
      }
      return undefined;
    });
  }
}
