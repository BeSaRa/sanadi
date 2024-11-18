import { Component, effect, inject, Injector, Signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { CommonCaseStatus } from '@app/enums/common-case-status.enum';
import { EntityType } from '@app/enums/entity-type-enum';
import { OpenFrom } from '@app/enums/open-from.enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { ProfileTypes } from '@app/enums/profile-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { Lookup } from '@app/models/lookup';
import { PenaltiesAndViolations } from '@app/models/penalties-and-violations';
import { DialogService } from '@app/services/dialog.service';
import { EmployeeService } from '@app/services/employee.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { PenaltiesAndViolationsService } from '@app/services/penalties-and-violations.service';
import { ProfileService } from '@app/services/profile.service';
import { ToastService } from '@app/services/toast.service';
import { TabMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { map, Observable, of, switchMap, takeUntil, tap } from 'rxjs';
import { IncidentElementsComponent } from '../../shared/incident-elements/incident-elements.component';
import { PenaltyService } from '@app/services/penalty.service';
import { AttachmentTypeService } from '@app/services/attachment-type.service';
import { FactoryService } from '@app/services/factory.service';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { LegalActionsComponent } from '../../shared/legal-actions/legal-actions.component';

@Component({
  selector: 'penalties-and-violations',
  templateUrl: 'penalties-and-violations.component.html',
  styleUrls: ['penalties-and-violations.component.scss']
})
export class PenaltiesAndViolationsComponent extends EServicesGenericComponent<PenaltiesAndViolations, PenaltiesAndViolationsService> {
  lang = inject(LangService);
  lookupService = inject(LookupService);
  dialog = inject(DialogService);
  toast = inject(ToastService);
  service = inject(PenaltiesAndViolationsService);
  employeeService = inject(EmployeeService);
  fb = inject(UntypedFormBuilder);
  profileService = inject(ProfileService);
  injector = inject(Injector);
  teams = this.employeeService.teams.filter(item => item.category === 1)


  constructor() {
    super();
  }
  organizations = toSignal(this.profileService.getProfilesByProfileType([ProfileTypes.CHARITY, ProfileTypes.INSTITUTION]));

  entityTypes: Lookup[] = this.lookupService.listByCategory.EntityType;

  form!: UntypedFormGroup;

  @ViewChild(IncidentElementsComponent) incidentsElementsRef!: IncidentElementsComponent
  get incidentsControl(): UntypedFormControl {
    return this.form.get('incidents') as UntypedFormControl;
  }

  get incidentReportControl(): UntypedFormControl {
    return this.form.get('incidentReport') as UntypedFormControl;
  }
  get legalBasisControl(): UntypedFormControl {
    return this.form.get('legalBasis') as UntypedFormControl;
  }
  get legalActionControl(): UntypedFormControl {
    return this.form.get('legalAction') as UntypedFormControl;
  }
  get proposedSanctionControl(): UntypedFormControl {
    return this.form.get('proposedSanction') as UntypedFormControl;
  }
  get specialExplanationsControl(): UntypedFormControl {
    return this.form.get('description') as UntypedFormControl;
  }
  get entityTypeControl(): UntypedFormControl {
    return this.form.get('entityType') as UntypedFormControl;
  }
  get organizationIdControl(): UntypedFormControl {
    return this.form.get('organizationId') as UntypedFormControl;
  }
  get externalEntityDTOControl(): UntypedFormControl {
    return this.form.get('externalEntityDTO') as UntypedFormControl;
  }

  entityTypeChanged!: Signal<number>

  get isIncidentRelationValid() {
    return this.entityTypeControl.valid && this.organizationIdControl.valid && this.externalEntityDTOControl.valid
  }
  get isOtherEntitiesEntityType() {
    return this.entityTypeControl.value === EntityType.INDIVIDUALS_AND_OTHER_ENTITIES
  }
  get isCharitiesEntityType() {
    return this.entityTypeControl.value === EntityType.CHARITIES_AND_KNOWLEDGEABLE_ENTITIES
  }
  _getNewInstance(): PenaltiesAndViolations {
    return new PenaltiesAndViolations();

  }

  _initComponent(): void {
  }

  _buildForm(): void {
    const model = new PenaltiesAndViolations();
    this.form = this.fb.group(model.buildForm(true));
  }

  _afterBuildForm(): void {
    this.setDefaultValues();
    this.handleReadonly();

    this._listenToEntityTypeChanged();
  }


  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    return saveType === SaveTypes.DRAFT ? true : this.form.valid;
  }

  _beforeLaunch(): boolean | Observable<boolean> {

    // if (!this.model?.canLaunch()) {
    //   this.dialog.error(this.model?.invalidLaunchMessage());
    //   return false
    // }


    return true;
  }


  _afterLaunch(): void {
    this.resetForm$.next(false);
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _prepareModel(): PenaltiesAndViolations | Observable<PenaltiesAndViolations> {
    return new PenaltiesAndViolations().clone({
      ...this.model,
      ...this.form.getRawValue(),

    });
  }

  _afterSave(model: PenaltiesAndViolations, saveType: SaveTypes, operation: OperationTypes): void {
    this.model = model;
    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({ serial: model.fullSerial }));
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  _saveFail(error: any): void {
    // throw new Error('Method not implemented.');
    console.log(error);
  }

  _launchFail(error: any): void {
    throw new Error('Method not implemented.');
  }

  _destroyComponent(): void {
    // throw new Error('Method not implemented.');
  }

  _updateForm(model: PenaltiesAndViolations | undefined): void {
    if (!model) {
      return;
    }
    this.model = model;
    this.form.patchValue({ ...this.model });

    this.makeRequiredIfHasId([
      this.legalBasisControl,
      this.legalActionControl,
      this.proposedSanctionControl
    ]);
  }
@ViewChild(IncidentElementsComponent) incidentElementsRef?: IncidentElementsComponent;
@ViewChild(LegalActionsComponent) legalActionsRef?: LegalActionsComponent;
  _resetForm(): void {
    this.form.reset();
    this.incidentElementsRef?.form.reset();
    this.legalActionsRef?.control.reset();
    this.operation = OperationTypes.CREATE;
    this.setDefaultValues();
  }

  private setDefaultValues(): void {
    if (this.operation === OperationTypes.CREATE) {
    }
  }

  handleReadonly(): void {
    // if record is new, no readonly (don't change as default is readonly = false)
    if (!this.model?.id) {
      return;
    }

    let caseStatus = this.model.getCaseStatus();
    if (caseStatus == CommonCaseStatus.FINAL_APPROVE || caseStatus === CommonCaseStatus.FINAL_REJECTION) {
      this.readonly = true;
      this.form.disable();
      return;
    }

    if (this.openFrom === OpenFrom.USER_INBOX) {
      this.readonly = false;


    } else if (this.openFrom === OpenFrom.TEAM_INBOX) {
      // after claim, consider it same as user inbox and use same condition
      if (this.model.taskDetails.isClaimed()) {
        this.readonly = false;

      }
    } else if (this.openFrom === OpenFrom.SEARCH) {
      // if saved as draft and opened by creator who is charity user, then no readonly
      if (this.model?.canCommit()) {
        this.readonly = false;
      }
    }
    this.readonly ? this.form.disable() : this.form.enable()

  }



  tabsData: TabMap = {
    incidents: {
      name: 'incidents',
      langKey: 'lbl_incidence_elements',
      index: 0,
      validStatus: () => this.incidentsElementsRef?.form.valid,
      isTouchedOrDirty: () => true
    },
    incidentRelation: {
      name: 'incidentRelation',
      langKey: 'lbl_incident_relation',
      index: 1,
      validStatus: () => this.isIncidentRelationValid,
      isTouchedOrDirty: () => true
    },
    incidentReport: {
      name: 'incidentReport',
      langKey: 'lbl_incident_reports',
      index: 2,
      validStatus: () => this.incidentReportControl?.valid,
      isTouchedOrDirty: () => true
    },
    legalBasis: {
      name: 'legalBasis',
      langKey: 'menu_legal_basis',
      index: 3,
      validStatus: () => this.legalBasisControl.valid,
      isTouchedOrDirty: () => true
    },
    legalActions: {
      name: 'legalActions',
      langKey: 'menu_legal_action',
      index: 4,
      validStatus: () => this.legalActionControl.valid,
      isTouchedOrDirty: () => true
    },
    proposedSanctions: {
      name: 'proposedSanctions',
      langKey: 'menu_penalties',
      index: 5,
      validStatus: () => this.proposedSanctionControl.valid,
      isTouchedOrDirty: () => true
    },
    specialExplanations: {
      name: 'specialExplanationsTab',
      langKey: 'special_explanations',
      index: 6,
      isTouchedOrDirty: () => true,
      show: () => true,
      validStatus: () => this.specialExplanationsControl.valid,
    },
    attachments: {
      name: 'attachments',
      langKey: 'attachments',
      index: 7,
      validStatus: () => true,
      isTouchedOrDirty: () => true
    }
  }
  getTabInvalidStatus(tabName: string): boolean {
    let tab = this.tabsData[tabName];
    if (!tab) {
      console.info('tab not found: %s', tabName);
      return true; // if tab not found, consider it invalid
    }
    if (!tab.checkTouchedDirty) {
      return !tab.validStatus();
    }
    return !tab.validStatus() && tab.isTouchedOrDirty();
  }
  _listenToEntityTypeChanged() {
    this.entityTypeControl.valueChanges.pipe(
      tap((type) => {
        if (type === EntityType.CHARITIES_AND_KNOWLEDGEABLE_ENTITIES) {
          this.organizationIdControl.setValidators([CustomValidators.required]);
          this.externalEntityDTOControl.clearValidators();
        } else {
          this.organizationIdControl.clearValidators();
          this.externalEntityDTOControl.setValidators([CustomValidators.requiredArray]);
        }
        this.organizationIdControl.updateValueAndValidity();
        this.externalEntityDTOControl.updateValueAndValidity();
      }),
      takeUntil(this.destroy$)

    ).subscribe();

  }
  makeRequiredIfHasId(controls: AbstractControl<[]>[]): void {
    controls.forEach(control => {
      if (!!this.model!.id) {
        control.setValidators([CustomValidators.requiredArray]);
      } else {
        control.clearValidators();
      }
      control.updateValueAndValidity();
    });
  }
}
