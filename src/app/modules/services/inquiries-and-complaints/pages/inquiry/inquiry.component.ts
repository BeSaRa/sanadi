import {Component} from '@angular/core';
import {SaveTypes} from '@app/enums/save-types';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {Inquiry} from '@app/models/inquiry';
import {InquiryService} from '@services/inquiry.service';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {forkJoin, Observable} from 'rxjs';
import {LangService} from '@services/lang.service';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {DialogService} from '@services/dialog.service';
import {LookupService} from '@services/lookup.service';
import {ToastService} from '@services/toast.service';
import {EmployeeService} from '@services/employee.service';
import {InternalDepartmentService} from '@services/internal-department.service';
import {map, takeUntil} from 'rxjs/operators';
import {InternalDepartment} from '@app/models/internal-department';
import {TabMap} from '@app/types/types';
import {OpenFrom} from '@app/enums/open-from.enum';
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';
import {CommonUtils} from '@helpers/common-utils';
import {Lookup} from '@app/models/lookup';
import {CaseTypes} from "@enums/case-types.enum";
import {ServiceDataService} from "@services/service-data.service";

@Component({
  selector: 'inquiry',
  templateUrl: './inquiry.component.html',
  styleUrls: ['./inquiry.component.scss']
})
export class InquiryComponent extends EServicesGenericComponent<Inquiry, InquiryService> {
  constructor(public lang: LangService,
              public service: InquiryService,
              public fb: UntypedFormBuilder,
              private dialog: DialogService,
              private lookupService: LookupService,
              private toast: ToastService,
              private intDepService: InternalDepartmentService,
              private serviceDataService: ServiceDataService,
              public employeeService: EmployeeService,) {
    super();
  }

  form!: UntypedFormGroup;
  departments: InternalDepartment[] = [];
  allowEditRecommendations: boolean = true;
  operation: OperationTypes = OperationTypes.CREATE;
  categories: Lookup[] = this.lookupService.listByCategory.InquiryCategory;
  loadAttachments: boolean = false;
  tabsData: TabMap = {
    basicInfo: {
      index: 0,
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info',
      validStatus: () => this.form && this.form.valid,
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
  }

  _buildForm(): void {
    const inquiry = this._getNewInstance();
    this.form = this.fb.group(inquiry.getFormFields(true));
  }

  _afterBuildForm(): void {
  }

  _prepareModel(): Observable<Inquiry> | Inquiry {
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

  _afterSave(model: Inquiry, saveType: SaveTypes, operation: OperationTypes): void {
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

  _beforeLaunch(): boolean | Observable<boolean> {
    return !!this.model && this.form.valid && this.model.canStart();
  }

  _afterLaunch(): void {
    this.resetForm$.next();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _destroyComponent(): void {
  }

  _getNewInstance(): Inquiry {
    return new Inquiry();
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

  _updateForm(model: Inquiry | undefined): void {
    this.model = model;
    if (!model) {
      return;
    }
    this.form.patchValue(model.getFormFields());
  }

  private loadDepartments(): void {
    this.intDepService.loadAsLookups()
      .pipe(takeUntil(this.destroy$))
      .subscribe(deps => this.departments = deps);
  }

  private loadDepartmentsByCaseType(): void {
    const serviceData = this.serviceDataService.loadByCaseType(CaseTypes.INQUIRY)
      .pipe(
        map(result => result.concernedDepartmentsIdsParsed ?? []),
      );

    const internalDepartments = this.intDepService.loadAsLookups()

    forkJoin([serviceData, internalDepartments])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([relatedDepartments, allDepartments]) => {
        this.departments = allDepartments.filter(dep => {
          return relatedDepartments.includes(dep.id);
        });
      })
  }

  onCompetentDepChange(depId: number): void {
    const dep = this.departments.find(item => item.id === depId);
    dep ? this.setAuthName(dep) : this.setAuthName(null);
  }

  setAuthName(dep: InternalDepartment | null): void {
    this.competentDepartmentAuthNameField?.setValue(dep ? dep.mainTeam.authName : null);
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
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

  private displayInvalidFormMessage(): void {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled).onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => CommonUtils.displayFormValidity(this.form, 'main-content'));
  }

  private _updateModelAfterSave(model: Inquiry): void {
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
