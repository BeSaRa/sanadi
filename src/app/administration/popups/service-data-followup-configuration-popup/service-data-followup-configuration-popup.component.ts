import {Component, Inject} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {ServiceDataFollowupConfiguration} from '@models/service-data-followup-configuration';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {Observable} from 'rxjs';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {LookupService} from '@app/services/lookup.service';
import {Lookup} from '@app/models/lookup';
import {TeamService} from '@app/services/team.service';
import {Team} from '@app/models/team';
import {FollowUpType} from '@app/enums/followUp-type.enum';
import {CustomValidators} from '@app/validators/custom-validators';
import {RequestTypeFollowupService} from '@services/request-type-followup.service';
import {CaseTypes} from '@app/enums/case-types.enum';
import {ToastService} from '@services/toast.service';

@Component({
  selector: 'service-data-followup-configuration-popup',
  templateUrl: './service-data-followup-configuration-popup.component.html',
  styleUrls: ['./service-data-followup-configuration-popup.component.scss']
})
export class ServiceDataFollowupConfigurationPopupComponent extends AdminGenericDialog<ServiceDataFollowupConfiguration> {

  model: ServiceDataFollowupConfiguration;
  form!: UntypedFormGroup;
  operation: OperationTypes;
  requestTypes: Lookup[] = [];
  followUpTypes: Lookup[] = this.lookupService.listByCategory.FollowUpType;
  teams!: Team[];
  saveVisible = true;
  internalFollowupServices: CaseTypes[] = [
    CaseTypes.INQUIRY,
    CaseTypes.CONSULTATION,
    CaseTypes.INTERNATIONAL_COOPERATION
  ];

  constructor(public fb: UntypedFormBuilder,
              public dialogRef: DialogRef,
              public lang: LangService,
              private lookupService: LookupService,
              private toast: ToastService,
              private teamService: TeamService,
              private requestTypeFollowupService: RequestTypeFollowupService,
              @Inject(DIALOG_DATA_TOKEN) private data: IDialogData<ServiceDataFollowupConfiguration>) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.requestTypes = this.requestTypeFollowupService.serviceRequestTypes[this.model.caseType] || [this.requestTypeFollowupService.getNewRequestType()];
    if (this.isInternalFollowupService(this.model.caseType)) {
      this.followUpTypes = this.followUpTypes.filter(x => x.lookupKey === FollowUpType.INTERNAL);
      if (this.operation === OperationTypes.CREATE) {
        this.model.followUpType = FollowUpType.INTERNAL;
      }
    }
  }

  get readonly(): boolean {
    return this.operation === OperationTypes.VIEW;
  }

  initPopup(): void {
    this.loadTeams();
    this.listenToFollowUpTypeChange();
  }

  destroyPopup(): void {
    // throw new Error('Method not implemented.');
  }

  afterSave(model: ServiceDataFollowupConfiguration, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.toast.success(message.change({x: model.getName()}));
    dialogRef.close();
  }

  beforeSave(model: ServiceDataFollowupConfiguration, form: UntypedFormGroup): boolean | Observable<boolean> {
    return this.form.valid;
  }

  prepareModel(model: ServiceDataFollowupConfiguration, form: UntypedFormGroup): ServiceDataFollowupConfiguration | Observable<ServiceDataFollowupConfiguration> {
    const newModel = new ServiceDataFollowupConfiguration().clone({
      ...this.model,
      ...this.form.getRawValue()
    });
    if (this.operation == OperationTypes.CREATE) {
      newModel.serviceId = this.model.serviceId;
      newModel.caseType = this.model.caseType;
    }
    return newModel;
  }

  saveFail(error: Error): void {
    console.log(error);
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));

    if (this.readonly) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
  }

  loadTeams() {
    this.teamService.loadAsLookups().subscribe(value => {
      this.teams = value;
    });
  }

  get followUpType() {
    return this.form.controls['followUpType'];
  }

  get concernedTeam() {
    return this.form.controls['concernedTeamId'];
  }

  get responsibleTeam() {
    return this.form.controls['responsibleTeamId'];
  }

  private listenToFollowUpTypeChange() {
    this.followUpType.valueChanges.subscribe(value => {
      if (value === FollowUpType.INTERNAL) {
        this.responsibleTeam.setValue('');
        this.responsibleTeam.disable();
        this.concernedTeam.enable();
      } else {
        this.concernedTeam.setValue('');
        this.concernedTeam.disable();
        this.responsibleTeam.enable();
      }
      this.concernedTeam.setValidators(value === FollowUpType.INTERNAL ? [CustomValidators.required] : []);
      this.concernedTeam.updateValueAndValidity();
      this.responsibleTeam.setValidators(value === FollowUpType.EXTERNAL ? [CustomValidators.required] : []);
      this.responsibleTeam.updateValueAndValidity();
    });
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.lang.map.followup_configuration_add;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.followup_configuration_edit;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  }

  private isInternalFollowupService(caseType: number): boolean {
    return this.internalFollowupServices.includes(caseType);
  }
}
