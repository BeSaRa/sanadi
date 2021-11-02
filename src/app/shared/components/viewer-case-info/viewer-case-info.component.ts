import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {CaseModel} from '@app/models/case-model';
import {QueryResult} from '@app/models/query-result';
import {LangService} from '@app/services/lang.service';
import {AdminResult} from "@app/models/admin-result";
import {EServiceGenericService} from '@app/generics/e-service-generic-service';
import {CaseTypes} from '@app/enums/case-types.enum';
import {FinalApprovalDocument} from '@app/models/final-approval-document';
import {Observable, Subject} from 'rxjs';
import {FinalExternalOfficeApprovalService} from '@app/services/final-external-office-approval.service';
import {filter, map, takeUntil} from 'rxjs/operators';
import {LicenseService} from '@app/services/license.service';

@Component({
  selector: 'viewer-case-info',
  templateUrl: './viewer-case-info.component.html',
  styleUrls: ['./viewer-case-info.component.scss']
})
export class ViewerCaseInfoComponent implements OnInit, OnDestroy {
  @Input()
  model!: CaseModel<any, any> | QueryResult;
  @Input()
  loadedModel!: any;

  @Input() componentService?: EServiceGenericService<any>;
  showManagerRequestStatus: boolean = false;

  showFinalGeneratedLicense: boolean = false;
  selectedFinalLicense?: FinalApprovalDocument;

  destroy$: Subject<any> = new Subject<any>();


  constructor(public lang: LangService,
              private licenseService: LicenseService,
              private finalExternalOfficeApprovalService: FinalExternalOfficeApprovalService) {
  }

  ngOnInit(): void {
    this.showManagerRequestStatus = !!this.loadedModel.managerDecision;
    this._setShowFinalGeneratedLicense();
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private _setShowFinalGeneratedLicense(): void {
    let caseStatusEnum = this.componentService?.caseStatusEnumMap[this.loadedModel.getCaseType()];
    this.showFinalGeneratedLicense = caseStatusEnum && (this.loadedModel.getCaseStatus() === caseStatusEnum.FINAL_APPROVE) && (this.loadedModel.getCaseType() === CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL);
    if (this.showFinalGeneratedLicense) {
      this.loadFinalLicencesByCriteria(this.loadedModel.licenseNumber)
        .pipe(
          filter(list => !!list.length),
          map(list => list[0]),
          takeUntil(this.destroy$)
        ).subscribe((license) => {
        this.selectedFinalLicense = license;
      });
    }
  }

  loadFinalLicencesByCriteria(value: any): Observable<FinalApprovalDocument[]> {
    return this.finalExternalOfficeApprovalService.licenseSearch({licenseNumber: value});
  }

  get finalGeneratedLicenseNumber(): string {
    return this.loadedModel.licenseNumber;
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

  viewLicense(): void {
    if (!this.selectedFinalLicense)
      return;

    this.licenseService.openSelectLicenseDialog([this.selectedFinalLicense], this.model, false)
  }

  isTemplateModelServiceAndApproved() {
    return this.model.getCaseType() === CaseTypes.EXTERNAL_PROJECT_MODELS && this.model.getCaseStatus() === 4 // approved
  }

  get templateSerial(): string {
    return this.isTemplateModelServiceAndApproved() && this.model.isCase() ? (this.model as any).templateFullSerial + '' : ''
  }
}
