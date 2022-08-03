import {Component, Inject} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {FollowupConfiguration} from '@app/models/followup-configuration';
import {FormBuilder, FormGroup} from '@angular/forms';
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

@Component({
  selector: 'followup-configuration-popup',
  templateUrl: './followup-configuration-popup.component.html',
  styleUrls: ['./followup-configuration-popup.component.scss']
})
export class FollowupConfigurationPopupComponent extends AdminGenericDialog<FollowupConfiguration> {

  model: FollowupConfiguration;
  form!: FormGroup;
  operation: OperationTypes;
  requestTypes: Lookup[] = []
  followUpTypes: Lookup[] = this.lookupService.listByCategory.FollowUpType;
  teams!: Team[];
  saveVisible = true;
  serviceId!: number;
  caseType!: number;

  constructor(public fb: FormBuilder,
              public dialogRef: DialogRef,
              public lang: LangService,
              private lookupService: LookupService,
              private teamService: TeamService,
              private requestTypeFollowupService: RequestTypeFollowupService,
              @Inject(DIALOG_DATA_TOKEN) private data: IDialogData<FollowupConfiguration>) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.serviceId = data.serviceId;
    this.caseType = data.caseType;
    this.requestTypes = this.requestTypeFollowupService.serviceRequestTypes[this.caseType] || [this.requestTypeFollowupService.getNewRequestType()];
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

  afterSave(model: FollowupConfiguration, dialogRef: DialogRef): void {
    dialogRef.close();
  }

  beforeSave(model: FollowupConfiguration, form: FormGroup): boolean | Observable<boolean> {
    return this.form.valid;
  }

  prepareModel(model: FollowupConfiguration, form: FormGroup): FollowupConfiguration | Observable<FollowupConfiguration> {
    const newModel = new FollowupConfiguration().clone({
      ...this.model,
      ...this.form.getRawValue()
    });
    if (this.operation == OperationTypes.CREATE) {
      newModel.serviceId = this.serviceId;
      newModel.caseType = this.caseType;
    }
    return newModel;
  }

  saveFail(error: Error): void {
    console.log(error);
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));

    if (this.readonly){
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
  }

  loadTeams() {
    this.teamService.load().subscribe(value => {
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
        this.responsibleTeam.setValue('')
        this.responsibleTeam.disable();
        this.concernedTeam.enable();
      } else {
        this.concernedTeam.setValue('')
        this.concernedTeam.disable();
        this.responsibleTeam.enable();
      }
      this.concernedTeam.setValidators(value === FollowUpType.INTERNAL ? [CustomValidators.required] : []);
      this.concernedTeam.updateValueAndValidity();
      this.responsibleTeam.setValidators(value === FollowUpType.EXTERNAL ? [CustomValidators.required] : []);
      this.responsibleTeam.updateValueAndValidity();
    })
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
}
