import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {CaseModel} from '@app/models/case-model';
import {QueryResult} from '@app/models/query-result';
import {LangService} from '@app/services/lang.service';
import {AdminResult} from "@app/models/admin-result";
import {EServiceGenericService} from '@app/generics/e-service-generic-service';
import {CaseTypes} from '@app/enums/case-types.enum';
import {FinalApprovalDocument} from '@app/models/final-approval-document';
import {Observable, of, Subject} from 'rxjs';
import {FinalExternalOfficeApprovalService} from '@app/services/final-external-office-approval.service';
import {filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {LicenseService} from '@app/services/license.service';
import {InternalProjectLicenseResult} from '@app/models/internal-project-license-result';
import {ProjectModelService} from '@app/services/project-model.service';
import {BlobModel} from '@app/models/blob-model';
import {SharedService} from '@app/services/shared.service';

@Component({
  selector: 'viewer-case-info',
  templateUrl: './viewer-case-info.component.html',
  styleUrls: ['./viewer-case-info.component.scss']
})
export class ViewerCaseInfoComponent implements OnInit, OnDestroy {
  // the model that the user clicked on it
  @Input()
  model!: CaseModel<any, any> | QueryResult;
  // the model that we load to display inside the viewer
  @Input()
  loadedModel!: any;

  @Input() componentService?: EServiceGenericService<any>;
  showManagerRequestStatus: boolean = false;

  finalExternalOfficeGeneratedLicense?: FinalApprovalDocument;
  internalProjectGeneratedLicense?: InternalProjectLicenseResult;

  destroy$: Subject<any> = new Subject<any>();
  caseStatusEnum: any;

  constructor(public lang: LangService,
              private licenseService: LicenseService,
              private sharedService: SharedService) {
  }

  ngOnInit(): void {
    this.caseStatusEnum = this.componentService?.caseStatusEnumMap[this.loadedModel.getCaseType()];
    // this.showManagerRequestStatus = !!this.loadedModel.managerDecision;
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  get username(): string {
    return this.model instanceof QueryResult ? this.model.fromUserInfo.getName() : this.model.creatorInfo.getName();
  };

  get fullSerial(): string {
    return this.model instanceof QueryResult ? this.model.BD_FULL_SERIAL : this.model.fullSerial;
  };

  get creationDate(): string {
    return this.model instanceof QueryResult ? this.model.PI_CREATE : this.model.createdOn;
  }

  get managerJustification(): string | null {
    return this.loadedModel.managerJustification ? this.loadedModel.managerJustification : null;
  }

  get managerDecisionInfo(): AdminResult | null {
    return this.loadedModel.managerDecision ? this.loadedModel.managerDecisionInfo : null;
  }

  get generalManagerJustification(): string | null {
    return this.loadedModel.generalManagerJustification ? this.loadedModel.generalManagerJustification : null;
  }

  get generalManagerDecisionInfo(): AdminResult | null {
    return this.loadedModel.generalManagerDecision ? this.loadedModel.generalManagerDecisionInfo : null;
  }

  get finalExternalOfficeGeneratedLicenseNumber(): string {
    return this.loadedModel.licenseNumber || '';
  }

  get finalExternalOfficeApprovalService(): FinalExternalOfficeApprovalService | undefined {
    if (!this.componentService) {
      return undefined;
    }

    return (this.componentService as unknown as FinalExternalOfficeApprovalService);
  }

  canShowFinalExternalOfficeGeneratedLicense(): boolean {
    let caseStatusEnum = this.componentService?.caseStatusEnumMap[this.loadedModel.getCaseType()];
    return caseStatusEnum && (this.loadedModel.getCaseStatus() === caseStatusEnum.FINAL_APPROVE) && (this.loadedModel.getCaseType() === CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL);
  }

  loadFinalExternalOfficeLicenceByCriteria(value: any): Observable<FinalApprovalDocument[]> {
    if (!this.componentService) {
      return of([]);
    }
    return this.finalExternalOfficeApprovalService!.licenseSearch({licenseNumber: value});
  }

  viewFinalExternalOfficeGeneratedLicense(): void {
    let loadedLicense$ = of(this.finalExternalOfficeGeneratedLicense)
      .pipe(switchMap(license => license ? of([license]) : this.loadFinalExternalOfficeLicenceByCriteria(this.finalExternalOfficeGeneratedLicenseNumber)));

    loadedLicense$.pipe(
      filter(list => !!list.length),
      map(list => list[0]),
      takeUntil(this.destroy$)
    ).subscribe((license) => {
      this.finalExternalOfficeGeneratedLicense = license;
      this.licenseService.openSelectLicenseDialog([this.finalExternalOfficeGeneratedLicense], this.model, false)
    })
  }

  get internalProjectGeneratedLicenseNumber(): string {
    return this.loadedModel.exportedLicenseFullserial || '';
  }

  get internalProjectGeneratedLicenseId(): string {
    return this.loadedModel.exportedLicenseId || '';
  }

  canShowInternalProjectGeneratedLicense(): boolean {
    return this.model.getCaseType() === CaseTypes.INTERNAL_PROJECT_LICENSE && this.caseStatusEnum && this.loadedModel.getCaseStatus() === this.caseStatusEnum.FINAL_APPROVE;
  }

  viewInternalProjectGeneratedLicense(): void {
    if (!this.internalProjectGeneratedLicenseId) {
      return;
    }
    let license = {
      documentTitle: this.internalProjectGeneratedLicenseNumber,
      id: this.internalProjectGeneratedLicenseId
    } as InternalProjectLicenseResult;

    this.licenseService.showLicenseContent(license, this.model.getCaseType())
      .subscribe((file) => {
        this.sharedService.openViewContentDialog(file, license);
      });
  }


  get projectsModelService(): ProjectModelService | undefined {
    if (!this.componentService) {
      return undefined;
    }

    return (this.componentService as unknown as ProjectModelService);
  }

  isTemplateModelServiceAndApproved() {
    return this.model.getCaseType() === CaseTypes.EXTERNAL_PROJECT_MODELS && this.model.getCaseStatus() === 4 // approved
  }

  get templateSerial(): string {
    return this.isTemplateModelServiceAndApproved() && this.model.isCase() ? (this.model as any).templateFullSerial + '' : ''
  }

  get generatedTemplateId(): string {
    return this.isTemplateModelServiceAndApproved() && this.model.isCase() ? (this.model as any).templateId + '' : ''
  }

  viewProjectModelTemplate(): void {
    if (!this.templateSerial || !this.projectsModelService) {
      return;
    }
    this.projectsModelService.exportTemplate(this.generatedTemplateId)
      .subscribe((file: BlobModel) => {
        this.sharedService.openViewContentDialog(file, {documentTitle: this.templateSerial});
      });
  }
}
