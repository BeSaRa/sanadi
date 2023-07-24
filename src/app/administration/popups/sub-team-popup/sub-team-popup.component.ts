import { TeamService } from '@app/services/team.service';
import { Team } from '@app/models/team';
import { Observable } from 'rxjs';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { ToastService } from '@app/services/toast.service';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { UserTypes } from '@app/enums/user-types.enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { Lookup } from '@app/models/lookup';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { Component, Inject } from '@angular/core';
import { SubTeam } from '@app/models/sub-team';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
  selector: 'app-sub-team-popup',
  templateUrl: './sub-team-popup.component.html',
  styleUrls: ['./sub-team-popup.component.scss']
})
export class SubTeamPopupComponent extends AdminGenericDialog<SubTeam> {
  teams: Team[] = [];
  form!: UntypedFormGroup;
  model!: SubTeam;
  operation: OperationTypes;
  saveVisible = true;
  userTypes: Lookup[] = this.lookupService.listByCategory.UserType.filter(x => x.lookupKey !== UserTypes.INTEGRATION_USER);

  constructor(public dialogRef: DialogRef,
    public fb: UntypedFormBuilder,
    public lang: LangService,
    private teamService: TeamService,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<SubTeam>,
    private toast: ToastService,
    private lookupService: LookupService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
  }

  initPopup(): void {
    this.teamService.loadAsLookups().subscribe((data: Team[]) => {
      this.teams = data;
    })
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    if (this.operation === OperationTypes.VIEW) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
  }

  beforeSave(model: SubTeam, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: SubTeam, form: UntypedFormGroup): Observable<SubTeam> | SubTeam {
    return (new SubTeam()).clone({ ...model, ...form.value });
  }

  afterSave(model: SubTeam, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.operation === this.operationTypes.CREATE
      ? this.toast.success(message.change({ x: this.form.controls[this.lang.map.lang + 'Name'].value }))
      : this.toast.success(message.change({ x: model.getName() }));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    dialogRef.close(model);
  }

  saveFail(error: Error): void {
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.lang.map.lbl_add_team;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_team;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  };

  destroyPopup(): void {
  }

}
