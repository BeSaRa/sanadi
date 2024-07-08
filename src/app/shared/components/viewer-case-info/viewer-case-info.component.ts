import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CaseModel } from '@app/models/case-model';
import { QueryResult } from '@app/models/query-result';
import { LangService } from '@app/services/lang.service';
import { AdminResult } from "@app/models/admin-result";
import { CaseTypes } from '@app/enums/case-types.enum';
import { FinalExternalOfficeApprovalResult } from '@app/models/final-external-office-approval-result';
import { Subject } from 'rxjs';
import { LicenseService } from '@app/services/license.service';
import { InternalProjectLicenseResult } from '@app/models/internal-project-license-result';
import { ProjectModelService } from '@app/services/project-model.service';
import { BlobModel } from '@app/models/blob-model';
import { SharedService } from '@app/services/shared.service';
import { InitialExternalOfficeApprovalResult } from '@app/models/initial-external-office-approval-result';
import { PartnerApproval } from '@app/models/partner-approval';
import { CommonCaseStatus } from '@app/enums/common-case-status.enum';
import { BaseGenericEService } from "@app/generics/base-generic-e-service";

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

  @Input() componentService?: BaseGenericEService<any>;
  showManagerRequestStatus: boolean = false;

  finalExternalOfficeGeneratedLicense?: FinalExternalOfficeApprovalResult;
  internalProjectGeneratedLicense?: InternalProjectLicenseResult;

  destroy$: Subject<void> = new Subject();

  constructor(public lang: LangService,
              private licenseService: LicenseService,
              private sharedService: SharedService) {
  }

  ngOnInit(): void {
    // this.showManagerRequestStatus = !!this.loadedModel.managerDecision;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
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

  /* get finalExternalOfficeGeneratedLicenseNumber(): string {
    return this.loadedModel.licenseNumber || '';
  }

  get finalExternalOfficeApprovalService(): FinalExternalOfficeApprovalService | undefined {
    if (!this.componentService) {
      return undefined;
    }

    return (this.componentService as unknown as FinalExternalOfficeApprovalService);
  }

 canShowFinalExternalOfficeGeneratedLicense(): boolean {
    return (this.loadedModel.getCaseStatus() === CommonCaseStatus.FINAL_APPROVE) && (this.loadedModel.getCaseType() === CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL);
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
  }*/

  get initialOfficeApprovalGeneratedLicenseNumber(): string {
    return this.loadedModel.exportedLicenseFullSerial || '';
  }

  get initialOfficeApprovalGeneratedLicenseId(): string {
    return this.loadedModel.exportedLicenseId || '';
  }

  canShowInitialOfficeApprovalGeneratedLicense(): boolean {
    return this.model.getCaseType() === CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL && this.loadedModel.getCaseStatus() === CommonCaseStatus.FINAL_APPROVE;
  }

  viewInitialOfficeApprovalGeneratedLicense(): void {
    if (!this.initialOfficeApprovalGeneratedLicenseId) {
      return;
    }
    let license = {
      documentTitle: this.initialOfficeApprovalGeneratedLicenseNumber,
      id: this.initialOfficeApprovalGeneratedLicenseId
    } as InitialExternalOfficeApprovalResult;

    this.licenseService.showLicenseContent(license, this.model.getCaseType())
      .subscribe((file) => {
        this.sharedService.openViewContentDialog(file, license);
      });
  }

  get partnerApprovalGeneratedLicenseNumber(): string {
    return this.loadedModel.exportedLicenseFullSerial || '';
  }

  get partnerApprovalGeneratedLicenseId(): string {
    return this.loadedModel.exportedLicenseId || '';
  }

  canShowPartnerApprovalGeneratedLicense(): boolean {
    return this.model.getCaseType() === CaseTypes.PARTNER_APPROVAL && this.loadedModel.getCaseStatus() === CommonCaseStatus.FINAL_APPROVE;
  }

  viewPartnerApprovalGeneratedLicense(): void {
    if (!this.partnerApprovalGeneratedLicenseId) {
      return;
    }
    // @ts-ignore
    let license = {
      documentTitle: this.partnerApprovalGeneratedLicenseNumber,
      id: this.partnerApprovalGeneratedLicenseId
    } as PartnerApproval;

    this.licenseService.showLicenseContent(license, this.model.getCaseType())
      .subscribe((file) => {
        this.sharedService.openViewContentDialog(file, license);
      });
  }

  get finalExternalOfficeApprovalGeneratedLicenseNumber(): string {
    return this.loadedModel.exportedLicenseFullSerial || '';
  }

  get finalExternalOfficeApprovalGeneratedLicenseId(): string {
    return this.loadedModel.exportedLicenseId || '';
  }

  canShowFinalExternalOfficeApprovalGeneratedLicense(): boolean {
    return this.model.getCaseType() === CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL && this.loadedModel.getCaseStatus() === CommonCaseStatus.FINAL_APPROVE;
  }

  viewFinalExternalOfficeApprovalGeneratedLicense(): void {
    if (!this.finalExternalOfficeApprovalGeneratedLicenseId) {
      return;
    }
    let license = {
      documentTitle: this.finalExternalOfficeApprovalGeneratedLicenseNumber,
      id: this.finalExternalOfficeApprovalGeneratedLicenseId
    } as FinalExternalOfficeApprovalResult;

    this.licenseService.showLicenseContent(license, this.model.getCaseType())
      .subscribe((file) => {
        this.sharedService.openViewContentDialog(file, license);
      });
  }

  get internalProjectGeneratedLicenseNumber(): string {
    return this.loadedModel.exportedLicenseFullSerial || '';
  }

  get internalProjectGeneratedLicenseId(): string {
    return this.loadedModel.exportedLicenseId || '';
  }

  canShowInternalProjectGeneratedLicense(): boolean {
    return this.model.getCaseType() === CaseTypes.INTERNAL_PROJECT_LICENSE && this.loadedModel.getCaseStatus() === CommonCaseStatus.FINAL_APPROVE;
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
