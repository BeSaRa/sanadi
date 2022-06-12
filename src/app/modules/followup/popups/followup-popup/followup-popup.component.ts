import {Component, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Followup} from '@app/models/followup';
import {Lookup} from '@app/models/lookup';
import {Team} from '@app/models/team';
import {LookupService} from '@app/services/lookup.service';
import {TeamService} from '@app/services/team.service';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {Observable} from 'rxjs';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {FollowupService} from '@app/services/followup.service';
import {LangService} from '@app/services/lang.service';
import {FollowUpType} from '@app/enums/followUp-type.enum';
import {CustomValidators} from '@app/validators/custom-validators';
import {IAngularMyDpOptions} from 'angular-mydatepicker';
import {DateUtils} from '@app/helpers/date-utils';

@Component({
  selector: 'followup-popup',
  templateUrl: './followup-popup.component.html',
  styleUrls: ['./followup-popup.component.scss']
})
export class FollowupPopupComponent extends AdminGenericDialog<Followup>{

  form: FormGroup = new FormGroup({});
  followup!: Followup;
  followUpTypes: Lookup[] = this.lookupService.listByCategory.FollowUpType;
  teams!: Team[];
  model: Followup = new Followup();
  saveVisible = true;
  operation!: OperationTypes;
  @Output() hideForm : EventEmitter<any> = new EventEmitter<any>();
  dateOptions: IAngularMyDpOptions = DateUtils.getDatepickerOptions({
    disablePeriod: 'past'
  });
  constructor(public fb: FormBuilder,
              private lookupService: LookupService,
              private teamService: TeamService,
              public dialogRef: DialogRef,
              public service: FollowupService,
              public lang: LangService,) {
    super();
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  loadTeams(){
    this.teamService.load().subscribe(value => {
      this.teams = value;
    });
  }

  afterSave(model: Followup, dialogRef: DialogRef): void {
    this.hideForm.emit();
  }

  beforeSave(model: Followup, form: FormGroup): Observable<boolean> | boolean {
    return true;
  }

  destroyPopup(): void {
  }

  initPopup(): void {
    this.loadTeams();
    this.listenToFollowUpTypeChange();
  }

  prepareModel(model: Followup, form: FormGroup): Observable<Followup> | Followup {
    this.model
    const newModel = new Followup().clone({
      ...this.model,
      ...this.form.getRawValue()
    });
    newModel.caseId = '{32570E7B-74E6-C661-8428-801D8FE00000}';
    return newModel;
  }

  saveFail(error: Error): void {
  }

  cancel() {
    this.hideForm.emit();
  }
  get followUpType(){
    return this.form.controls['followUpType'];
  }
  get concernedTeam(){
    return this.form.controls['concernedTeamId'];
  }
  get responsibleTeam(){
    return this.form.controls['responsibleTeamId'];
  }
  private listenToFollowUpTypeChange() {
    this.followUpType.valueChanges.subscribe( value =>{
      if(value === FollowUpType.INTERNAL) {
        this.responsibleTeam.setValue('')
        this.responsibleTeam.disable();
        this.concernedTeam.enable();
      }
      else{
        this.concernedTeam.setValue('')
        this.concernedTeam.disable();
        this.responsibleTeam.enable();
      }
      this.concernedTeam.setValidators(value === FollowUpType.INTERNAL? [CustomValidators.required]: []);
      this.concernedTeam.updateValueAndValidity();
      this.responsibleTeam.setValidators(value === FollowUpType.EXTERNAL? [CustomValidators.required]: []);
      this.responsibleTeam.updateValueAndValidity();
    })
  }
}
