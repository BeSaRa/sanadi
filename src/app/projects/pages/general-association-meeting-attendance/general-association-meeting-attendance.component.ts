import {AfterViewInit, ChangeDetectorRef, Component} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup} from '@angular/forms';
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
import {FormManager} from '@app/models/form-manager';
import {DatepickerControlsMap, DatepickerOptionsMap} from '@app/types/types';
import {DateUtils} from '@helpers/date-utils';
import {EmployeeService} from '@services/employee.service';
import {GeneralAssociationExternalMember} from '@app/models/general-association-external-member';
import {Lookup} from '@app/models/lookup';
import {exhaustMap, filter, map, takeUntil, tap} from 'rxjs/operators';
import {SelectedLicenseInfo} from '@contracts/selected-license-info';
import {InternalProjectLicenseResult} from '@app/models/internal-project-license-result';
import {SharedService} from '@services/shared.service';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {CustomValidators} from '@app/validators/custom-validators';

@Component({
  selector: 'general-association-meeting-attendance',
  templateUrl: './general-association-meeting-attendance.component.html',
  styleUrls: ['./general-association-meeting-attendance.component.scss']
})
export class GeneralAssociationMeetingAttendanceComponent extends EServicesGenericComponent<GeneralAssociationMeetingAttendance, GeneralAssociationMeetingAttendanceService> implements AfterViewInit {
  form!: FormGroup;
  internalMembersForm!: FormGroup;
  fm!: FormManager;
  private displayedColumns: string[] = ['fullSerial', 'status', 'requestTypeInfo', 'actions'];
  addAdministrativeBoardMembersLabel: keyof ILanguageKeys = 'add_administrative_board_member';
  addGeneralAssociationMembersLabel: keyof ILanguageKeys = 'add_general_association_members';

  selectedLicenses: GeneralAssociationMeetingAttendance[] = [];
  selectedLicenseDisplayedColumns: string[] = ['serial', 'requestType', 'licenseStatus', 'actions'];
  hasSearchedForLicense = false;

  requestTypes: Lookup[] = this.lookupService.listByCategory.CollectionRequestType
    .sort((a, b) => a.lookupKey - b.lookupKey);
  meetingTypes: Lookup[] = this.lookupService.listByCategory.MeetingType
    .sort((a, b) => a.lookupKey - b.lookupKey);
  meetingClassifications: Lookup[] = this.lookupService.listByCategory.MeetingClassification
    .sort((a, b) => a.lookupKey - b.lookupKey);

  datepickerControlsMap: DatepickerControlsMap = {};
  datepickerOptionsMap: DatepickerOptionsMap = {
    meetingDate: DateUtils.getDatepickerOptions({disablePeriod: 'past'})
  };

  isExternalUser!: boolean;
  selectedAdministrativeBoardMembers: GeneralAssociationExternalMember[] = [];
  selectedGeneralAssociationMembers: GeneralAssociationExternalMember[] = [];

  addAgendaFormActive!: boolean;
  agendaForm!: FormGroup;
  agendaItems: string[] = [];
  selectedAgendaItem!: string | null;
  selectedAgendaItemIndex!: number | null;

  agendaItemsDisplayedColumns: string[] = ['index', 'description', 'actions'];

  constructor(public lang: LangService,
              public fb: FormBuilder,
              private cd: ChangeDetectorRef,
              public service: GeneralAssociationMeetingAttendanceService,
              private lookupService: LookupService,
              private dialog: DialogService,
              private toast: ToastService,
              private licenseService: LicenseService,
              private employeeService: EmployeeService,
              private sharedService: SharedService) {
    super();
  }

  get basicInfo(): FormGroup {
    return this.form.get('basicInfo')! as FormGroup;
  }

  get meetingDate(): FormControl {
    return this.form.get('basicInfo.meetingDate')! as FormControl;
  }

  get specialExplanation(): FormGroup {
    return this.form.get('explanation')! as FormGroup;
  }

  get oldFullSerialField(): AbstractControl {
    return this.form.get('basicInfo.oldFullSerial')!;
  }

  get agendaItem(): FormControl {
    return this.agendaForm.get('description')! as FormControl;
  }

  _initComponent(): void {
    // load initials here
    this.isExternalUser = this.employeeService.isExternalUser();
    this.buildAgendaForm();
  }

  _buildForm(): void {
    const model = new GeneralAssociationMeetingAttendance();
    this.form = this.fb.group({
      basicInfo: this.fb.group(model.buildBasicInfo(true)),
      explanation: this.fb.group(model.buildExplanation(true))
    });

    this._buildDatepickerControlsMap();
    this.fm = new FormManager(this.form, this.lang);
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

  private _buildDatepickerControlsMap() {
    this.datepickerControlsMap = {
      meetingDate: this.meetingDate
    };
  }

  private validateSingleLicense(license: GeneralAssociationMeetingAttendance): Observable<null | SelectedLicenseInfo<GeneralAssociationMeetingAttendance, GeneralAssociationMeetingAttendance>> {
    return this.licenseService.validateLicenseByRequestType<GeneralAssociationMeetingAttendance>(this.model!.caseType, this.model!.requestType, license.id)
      .pipe(map(validated => {
        return (validated ? {
          selected: validated,
          details: validated
        } : null) as (null | SelectedLicenseInfo<GeneralAssociationMeetingAttendance, GeneralAssociationMeetingAttendance>);
      }));
  }

  private openSelectLicense(licenses: GeneralAssociationMeetingAttendance[]) {
    return this.licenseService.openSelectLicenseDialog(licenses, this.model, true, this.displayedColumns).onAfterClose$ as Observable<{ selected: GeneralAssociationMeetingAttendance, details: GeneralAssociationMeetingAttendance }>;
  }

  searchForLicense() {
    this.licenseService
      .generalAssociationMeetingAttendanceSearch<GeneralAssociationMeetingAttendance>({fullSerial: this.oldFullSerialField.value})
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(licenses => !licenses.length && this.dialog.info(this.lang.map.no_result_for_your_search_criteria)))
      .pipe(filter(licenses => !!licenses.length))
      .pipe(exhaustMap((licenses) => {
        return licenses.length === 1 ? this.validateSingleLicense(licenses[0]) : this.openSelectLicense(licenses);
      }))
      .pipe(
        filter<null | SelectedLicenseInfo<GeneralAssociationMeetingAttendance, GeneralAssociationMeetingAttendance>, SelectedLicenseInfo<GeneralAssociationMeetingAttendance, GeneralAssociationMeetingAttendance>>
        ((info): info is SelectedLicenseInfo<GeneralAssociationMeetingAttendance, GeneralAssociationMeetingAttendance> => !!info))
      .subscribe((_info) => {
        // set oldLicenseId property from validated object id
        _info.details.oldFullSerial = _info.details.id;

        // delete id property
        let tempObj = _info.details as any;
        delete tempObj.id;
        _info.details = new GeneralAssociationMeetingAttendance().clone(tempObj);

        this.hasSearchedForLicense = true;
        this.selectedLicenses = [_info.details];
        _info.details.requestType = this.model?.requestType!;
        this._updateForm(_info.details);
        this.oldFullSerialField.patchValue(_info.details.fullSerial);
      });
  }

  viewSelectedLicense(): void {
    let license = {
      documentTitle: this.selectedLicenses[0].fullSerial,
      id: this.selectedLicenses[0].id
    } as InternalProjectLicenseResult;
    this.licenseService.showLicenseContent(license, this.selectedLicenses[0].getCaseType())
      .subscribe((file) => {
        this.sharedService.openViewContentDialog(file, license);
      });
  }

  onAdministrativeBoardMembersChanged(memberList: GeneralAssociationExternalMember[]) {
    this.selectedAdministrativeBoardMembers = memberList;
  }

  onGeneralAssociationMembersChanged(memberList: GeneralAssociationExternalMember[]) {
    this.selectedGeneralAssociationMembers = memberList;
  }

  // add agenda items functionality
  buildAgendaForm(): void {
    this.agendaForm = this.fb.group({
      description: [null, [CustomValidators.required, CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX)]]
    });
  }

  openAddAgendaForm() {
    this.addAgendaFormActive = true;
  }

  selectAgendaItem(event: MouseEvent, item: string) {
    this.addAgendaFormActive = true;
    event.preventDefault();
    this.selectedAgendaItem = item;
    this.agendaForm.patchValue({description: this.selectedAgendaItem!});
    this.selectedAgendaItemIndex = this.agendaItems.indexOf(item);
  }

  saveAgendaItem() {
    const item = this.agendaItem.value;
    if (!this.selectedAgendaItem) {
      if (!this.isExistAgendaItemInCaseOfAdd(this.agendaItems, item)) {
        this.agendaItems = this.agendaItems.concat(item);
        this.resetAgendaForm();
        this.addAgendaFormActive = false;
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    } else {
      if (!this.isExistAgendaItemInCaseOfEdit(this.agendaItems, item, this.selectedAgendaItemIndex!)) {
        let newList = this.agendaItems.slice();
        newList.splice(this.selectedAgendaItemIndex!, 1);
        newList.splice(this.selectedAgendaItemIndex!, 0, item);
        this.agendaItems = newList;
        this.resetAgendaForm();
        this.addAgendaFormActive = false;
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    }
  }

  cancelAddMember() {
    this.resetAgendaForm();
    this.addAgendaFormActive = false;
  }

  resetAgendaForm() {
    this.selectedAgendaItem = null;
    this.selectedAgendaItemIndex = null;
    this.agendaForm.reset();
  }

  removeMember(event: MouseEvent, item: string) {
    event.preventDefault();
    this.agendaItems = this.agendaItems.filter(x => x != item);
    this.resetAgendaForm();
  }

  isExistAgendaItemInCaseOfAdd(agendaItems: string[], toBeAddedAgendaItem: string): boolean {
    return agendaItems.includes(toBeAddedAgendaItem);
  }

  isExistAgendaItemInCaseOfEdit(agendaItems: string[], toBeEditedAgendaItem: string, selectedIndex: number): boolean {
    for (let i = 0; i < agendaItems.length; i++) {
      if (i === selectedIndex) {
        continue;
      }

      if (agendaItems[i] === toBeEditedAgendaItem) {
        return true;
      }
    }
    return false;
  }

  getAgendaItemsAsString(agendaItems: string[]): string {
    return JSON.stringify(agendaItems);
  }

  getAgendaItemsAsJson(agendaItems: string) {
    if (agendaItems) {
      return JSON.parse(agendaItems);
    }
    return [];
  }
}
