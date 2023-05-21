import {Component} from '@angular/core';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {InternationalCooperation} from '@app/models/international-cooperation';
import {InternationalCooperationService} from '@services/international-cooperation.service';
import {SaveTypes} from '@app/enums/save-types';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {forkJoin, Observable} from 'rxjs';
import {LangService} from '@services/lang.service';
import {InternalDepartmentService} from '@services/internal-department.service';
import {CountryService} from '@services/country.service';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {DialogService} from '@services/dialog.service';
import {ToastService} from '@services/toast.service';
import {EmployeeService} from '@services/employee.service';
import {TabMap} from '@app/types/types';
import {Country} from '@app/models/country';
import {InternalDepartment} from '@app/models/internal-department';
import {map, takeUntil} from 'rxjs/operators';
import {OpenFrom} from '@app/enums/open-from.enum';
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';
import {CommonUtils} from '@helpers/common-utils';
import {CaseTypes} from "@enums/case-types.enum";
import {ServiceDataService} from "@services/service-data.service";

@Component({
  selector: 'international-cooperation',
  templateUrl: './international-cooperation.component.html',
  styleUrls: ['./international-cooperation.component.scss']
})
export class InternationalCooperationComponent extends EServicesGenericComponent<InternationalCooperation, InternationalCooperationService> {

  constructor(public lang: LangService,
              public service: InternationalCooperationService,
              public fb: UntypedFormBuilder,
              private dialog: DialogService,
              public intDepService: InternalDepartmentService,
              public serviceDataService: ServiceDataService,
              private countryService: CountryService,
              private toast: ToastService,
              public employeeService: EmployeeService) {
    super();
  }

  form!: UntypedFormGroup;
  countries: Country[] = [];
  allowEditRecommendations: boolean = true;
  loadAttachments: boolean = false;
  tabsData: TabMap = {
    basicInfo: {
      index: 0,
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info',
      validStatus: () => this.form.valid,
      isTouchedOrDirty: () => true
    },
    comments: {
      index: 1,
      name: 'commentsTab',
      langKey: 'comments',
      validStatus: () => true,
      isTouchedOrDirty: () => true
    },
    attachments: {
      index: 2,
      name: 'attachmentsTab',
      langKey: 'attachments',
      validStatus: () => true,
      isTouchedOrDirty: () => true
    },
    recommendations: {
      index: 3,
      name: 'recommendations',
      langKey: 'recommendations',
      validStatus: () => true,
      isTouchedOrDirty: () => true
    }
  };

  _initComponent(): void {
    this.loadDepartmentsByCaseType();
    this.loadCountries();
  }

  _buildForm(): void {
    const internationalCooperation = this._getNewInstance();
    this.form = this.fb.group(internationalCooperation.getFormFields(true));
  }

  _afterBuildForm(): void {
  }

  _prepareModel(): Observable<InternationalCooperation> | InternationalCooperation {
    return this._getNewInstance().clone({
      ...this.model,
      ...this.form.value
    });
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (saveType === SaveTypes.DRAFT) {
      return true;
    }
    if (this.form.invalid) {
      this.displayInvalidFormMessage();
      return false;
    }
    return true;
  }

  _afterSave(model: InternationalCooperation, saveType: SaveTypes, operation: OperationTypes): void {
    this._updateModelAfterSave(model);

    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({serial: model.fullSerial}));
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  _destroyComponent(): void {
  }

  _getNewInstance(): InternationalCooperation {
    return new InternationalCooperation();
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return !!this.model && this.form.valid && this.model.canStart();
  }

  _afterLaunch(): void {
    this.resetForm$.next();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _launchFail(error: any): void {
  }

  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
    this.operation = OperationTypes.CREATE;
  }

  _saveFail(error: any): void {
  }

  _updateForm(model: InternationalCooperation | undefined): void {
    this.model = model;
    if (!model) {
      return;
    }
    this.form.patchValue(model.getFormFields());
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  onCompetentDepChange(depId: number): void {
    const dep = this.service.departments.find(item => item.id === depId);
    dep ? this.setAuthName(dep) : this.setAuthName(null);
  }

  setAuthName(dep: InternalDepartment | null): void {
    this.competentDepartmentAuthNameField?.setValue(dep ? dep.mainTeam.authName : null);
  }

  get competentDepartmentAuthNameField(): UntypedFormControl {
    return this.form.get('competentDepartmentAuthName') as UntypedFormControl;
  }

  isAddCommentAllowed(): boolean {
    if (!this.model?.id || this.employeeService.isExternalUser()) {
      return false;
    }
    let isAllowed = true;
    if (this.openFrom === OpenFrom.TEAM_INBOX) {
      isAllowed = this.model.taskDetails.isClaimed();
    }
    return isAllowed;
  }

  isAttachmentReadonly(): boolean {
    if (!this.model?.id) {
      return false;
    }
    let isAllowed = true;
    if (this.openFrom === OpenFrom.TEAM_INBOX) {
      isAllowed = this.model.taskDetails.isClaimed();
    }
    if (isAllowed) {
      let caseStatus = this.model.getCaseStatus();
      isAllowed = (caseStatus !== CommonCaseStatus.CANCELLED && caseStatus !== CommonCaseStatus.FINAL_APPROVE && caseStatus !== CommonCaseStatus.FINAL_REJECTION);
    }
    return !isAllowed;
  }

  private loadDepartmentsByCaseType(): void {
    const serviceData = this.serviceDataService.loadByCaseType(CaseTypes.INTERNATIONAL_COOPERATION)
      .pipe(
        map(result => result.concernedDepartmentsIdsParsed ?? []),
      );

    const internalDepartments = this.intDepService.loadAsLookups()

    forkJoin([serviceData, internalDepartments])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([relatedDepartments, allDepartments]) => {
        this.service.departments = allDepartments.filter(dep => {
          return relatedDepartments.includes(dep.id);
        });
      })
  }

  private loadCountries() {
    this.countryService.loadAsLookups()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => this.countries = countries);
  }

  private displayInvalidFormMessage(): void {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled).onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => CommonUtils.displayFormValidity(this.form, 'main-content'));
  }

  private _updateModelAfterSave(model: InternationalCooperation): void {
    if ((this.openFrom === OpenFrom.USER_INBOX || this.openFrom === OpenFrom.TEAM_INBOX) && this.model?.taskDetails && this.model.taskDetails.tkiid) {
      this.service.getTask(this.model.taskDetails.tkiid)
        .subscribe((model) => {
          this.model = model;
        });
    } else {
      this.model = model;
    }
  }

}
