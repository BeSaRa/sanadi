import {AfterViewInit, ChangeDetectorRef, Component} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {GeneralAssociationMeetingAttendance} from '@app/models/general-association-meeting-attendance';
import {LangService} from '@app/services/lang.service';
import {GeneralAssociationMeetingAttendanceService} from '@services/general-association-meeting-attendance.service';
import {Observable} from 'rxjs';
import {LookupService} from '@services/lookup.service';
import {DialogService} from '@services/dialog.service';
import {ToastService} from '@services/toast.service';
import {LicenseService} from '@services/license.service';

@Component({
  selector: 'general-association-meeting-attendance',
  templateUrl: './general-association-meeting-attendance.component.html',
  styleUrls: ['./general-association-meeting-attendance.component.scss']
})
export class GeneralAssociationMeetingAttendanceComponent extends EServicesGenericComponent<GeneralAssociationMeetingAttendance, GeneralAssociationMeetingAttendanceService> implements AfterViewInit {
  form!: FormGroup;

  constructor(public lang: LangService,
              public fb: FormBuilder,
              private cd: ChangeDetectorRef,
              public service: GeneralAssociationMeetingAttendanceService,
              private lookupService: LookupService,
              private dialog: DialogService,
              private toast: ToastService,
              private licenseService: LicenseService) {
    super();
  }

  _initComponent(): void {
    // load initials here
  }

  _buildForm(): void {
    // build form here
    this.form = this.fb.group({})
  }

  _afterBuildForm(): void {

  }

  _updateForm(model: GeneralAssociationMeetingAttendance | undefined): void {

  }

  _resetForm(): void {
    this.form.reset();
  }

  _prepareModel(): GeneralAssociationMeetingAttendance | Observable<GeneralAssociationMeetingAttendance> {
    return new GeneralAssociationMeetingAttendance();
  }

  _getNewInstance(): GeneralAssociationMeetingAttendance {
    return new GeneralAssociationMeetingAttendance();
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    // extra validation here
    return this.form.valid;
  }

  _afterSave(model: GeneralAssociationMeetingAttendance, saveType: SaveTypes, operation: OperationTypes): void {
    this.model = model;
    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({serial: model.fullSerial}));
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  _saveFail(error: any): void {

  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return this.form.valid;
  }

  _afterLaunch(): void {
    this._resetForm();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _launchFail(error: any): void {

  }

  _destroyComponent(): void {

  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }
}
