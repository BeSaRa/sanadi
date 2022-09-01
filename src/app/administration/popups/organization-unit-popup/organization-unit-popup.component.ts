import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {OrgUnit} from '@app/models/org-unit';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {LookupService} from '@app/services/lookup.service';
import {ToastService} from '@app/services/toast.service';
import {LangService} from '@app/services/lang.service';
import {Lookup} from '@app/models/lookup';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {CustomValidators} from '@app/validators/custom-validators';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {FileStore} from '@app/models/file-store';
import {DialogService} from '@app/services/dialog.service';
import {ExceptionHandlerService} from '@app/services/exception-handler.service';
import {DateUtils} from '@app/helpers/date-utils';
import {FileExtensionsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {OrgUnitField} from '@app/models/org-unit-field';
import {OrgUnitFieldService} from '@app/services/org-unit-field.service';
import {OrganizationUnitService} from '@app/services/organization-unit.service';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {CommonUtils} from '@app/helpers/common-utils';
import {DatepickerControlsMap, DatepickerOptionsMap} from '@app/types/types';
import {OrgStatusEnum} from '@app/enums/status.enum';

@Component({
  selector: 'app-organization-unit-popup',
  templateUrl: './organization-unit-popup.component.html',
  styleUrls: ['./organization-unit-popup.component.scss']
})
export class OrganizationUnitPopupComponent extends AdminGenericDialog<OrgUnit> implements AfterViewInit {
  constructor(public dialogRef: DialogRef,
              @Inject(DIALOG_DATA_TOKEN) data: IDialogData<OrgUnit>,
              private lookupService: LookupService,
              public fb: UntypedFormBuilder,
              private cd: ChangeDetectorRef,
              private toast: ToastService,
              public langService: LangService,
              private dialogService: DialogService,
              private orgUnitService: OrganizationUnitService,
              private exceptionHandlerService: ExceptionHandlerService,
              private orgUnitFieldService: OrgUnitFieldService) {
    super();
    this.operation = data.operation;
    this.model = data.model;
  }

  @ViewChild('dialogContent') dialogContent!: ElementRef;
  @ViewChild('logoUploader') logoUploader!: ElementRef;

  form!: UntypedFormGroup;
  model!: OrgUnit;
  operation: OperationTypes;
  saveVisible = true;

  orgUnitTypesList: Lookup[] = [];
  orgUnitStatusList: Lookup[] = [];
  orgUnitsList: OrgUnit[] = [];
  cityList: Lookup[] = [];
  licensingAuthorityList: Lookup[] = [];
  workFieldList: Lookup[] = [];
  orgUnitFieldList: OrgUnitField[] = [];
  orgStatusEnum = OrgStatusEnum;

  tabsData: IKeyValue = {
    basic: {
      name: 'basic',
      langKey: 'lbl_basic_info',
      validStatus: () => this.form && this.basicInfoGroup && this.basicInfoGroup.valid
    },
    advanced: {
      name: 'advanced',
      langKey: 'advanced',
      validStatus: () => this.form && this.advancedGroup && this.advancedGroup.valid
    },
    services: {
      name: 'services',
      langKey: 'link_services',
      validStatus: () => true
    },
    branches: {
      name: 'branches',
      langKey: 'lbl_org_branches',
      validStatus: () => true
    }
  };

  datepickerControlsMap: DatepickerControlsMap = {};
  datepickerOptionsMap: DatepickerOptionsMap = {
    registryDate: DateUtils.getDatepickerOptions({disablePeriod: 'future'}),
    establishmentDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    budgetClosureDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'})
  };

  logoPath: string = '';
  logoFile: any;
  logoExtensions: string[] = [FileExtensionsEnum.PNG, FileExtensionsEnum.JPG, FileExtensionsEnum.JPEG];

  private _afterViewInit(): void {
    if (this.operation === OperationTypes.UPDATE) {
      this.displayFormValidity(null, this.dialogContent.nativeElement);
    }
    if (this.operation !== OperationTypes.CREATE) {
      this.orgCodeField && this.orgCodeField.disable();
    }
    this._buildDatepickerControlsMap();
  }

  ngAfterViewInit(): void {
    // used the private function to reuse functionality of afterViewInit if needed
    this._afterViewInit();

    this.cd.detectChanges();
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.langService.map.lbl_add_org_unit;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.langService.map.lbl_edit_org_unit;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.langService.map.view;
    }
    return '';
  }

  initPopup(): void {
    this.loadOrgUnitFields();
    this.orgUnitsList = this.orgUnitService.list;
    this.orgUnitTypesList = this.lookupService.listByCategory.OrgUnitType;
    this.orgUnitStatusList = this.lookupService.listByCategory.OrgStatus;
    this.cityList = this.lookupService.listByCategory.Countries;
    this.licensingAuthorityList = this.lookupService.listByCategory.LICENSING_AUTHORITY;
    this.workFieldList = this.lookupService.listByCategory.WORK_FIELD;
  }

  loadOrgUnitFields() {
    this.orgUnitFieldService.loadAsLookups().subscribe(list => {
      this.orgUnitFieldList = list;
    });
  }

  setDialogButtonsVisibility(tab: any): void {
    this.saveVisible = !(tab.name && (tab.name === this.tabsData.branches.name || tab.name === this.tabsData.services.name));
    this.validateFieldsVisible = !(tab.name && (tab.name === this.tabsData.branches.name || tab.name === this.tabsData.services.name));
  }

  buildForm(): void {
    this.form = this.fb.group({
      basic: this.fb.group(this.model.buildFormBasic(true), {
        validators: this.model.setBasicFormCrossValidations()
      }),
      advanced: this.fb.group(this.model.buildFormAdvanced(true), {
        validators: this.model.setAdvancedFormCrossValidations
      })
    });

    if (this.operation === OperationTypes.UPDATE) {
      if (this.model.logo) {
        this.logoPath = OrganizationUnitPopupComponent._changeByteArrayToBase64(this.model.logo);
      }
    }
  }

  private _buildDatepickerControlsMap(): void {
    this.datepickerControlsMap = {
      registryDate: this.registryDateField,
      establishmentDate: this.establishmentDateField,
      budgetClosureDate: this.budgetClosureDateField
    };
  }

  get basicInfoGroup(): UntypedFormGroup {
    return this.form.get('basic') as UntypedFormGroup;
  }

  get advancedGroup(): UntypedFormGroup {
    return this.form.get('advanced') as UntypedFormGroup;
  }

  get orgCodeField(): UntypedFormControl {
    return this.basicInfoGroup.get('orgCode') as UntypedFormControl;
  }

  get registryDateField(): UntypedFormControl {
    return this.basicInfoGroup.get('registryDate') as UntypedFormControl;
  }

  get establishmentDateField(): UntypedFormControl {
    return this.advancedGroup.get('establishmentDate') as UntypedFormControl;
  }

  get budgetClosureDateField(): UntypedFormControl {
    return this.advancedGroup.get('budgetClosureDate') as UntypedFormControl;
  }

  get arabicBoardMembersField(): UntypedFormControl {
    return this.advancedGroup.get('arabicBoardMembers') as UntypedFormControl;
  }

  get englishBoardMembersField(): UntypedFormControl {
    return this.advancedGroup.get('enBoardMembers') as UntypedFormControl;
  }

  beforeSave(model: OrgUnit, form: UntypedFormGroup): boolean | Observable<boolean> {
    const invalidTabs = this._getInvalidTabs();
    if (invalidTabs.length > 0) {
      const listHtml = CommonUtils.generateHtmlList(this.langService.map.msg_following_tabs_valid, invalidTabs);
      this.dialogService.error(listHtml.outerHTML);
      return false;
    } else {
      return true;
    }
  }

  private _getUpdatedValues(model: OrgUnit, form?: UntypedFormGroup): OrgUnit {
    if (!form) {
      form = this.form;
    }
    return (new OrgUnit()).clone({...model, ...form.value.basic, ...form.value.advanced});
  }

  prepareModel(model: OrgUnit, form: UntypedFormGroup): OrgUnit | Observable<OrgUnit> {
    return this._getUpdatedValues(model, form);
  }

  afterSave(model: OrgUnit, dialogRef: DialogRef): void {
    const message = (this.operation === OperationTypes.CREATE)
      ? this.langService.map.msg_create_x_success
      : this.langService.map.msg_update_x_success;
    this.model = model;
    this.operation = OperationTypes.UPDATE;

    if (!this.logoFile) {
      this.toast.success(message.change({x: model.getName()}));
      return;
    }

    model.saveLogo(this.logoFile)
      .pipe(
        catchError((err) => {
          this.exceptionHandlerService.handle(err);
          return of(null);
        })
      )
      .subscribe((result: boolean | null) => {
        if (!result) {
          return;
        }
        this._clearLogoUploader();
        this.toast.success(message.change({x: model.getName()}));
      });
  }

  saveFail(error: Error): void {
  }

  openFileBrowser($event: MouseEvent): void {
    $event?.stopPropagation();
    $event?.preventDefault();
    this.logoUploader?.nativeElement.click();
  }

  onLogoSelected($event: Event): void {
    let files = ($event.target as HTMLInputElement).files;
    if (files && files[0]) {
      const extension = files[0].name.getExtension().toLowerCase();
      if (this.logoExtensions.indexOf(extension) === -1) {
        this.dialogService.error(this.langService.map.msg_invalid_format_allowed_formats.change({formats: this.logoExtensions.join(', ')}));
        this.logoPath = '';
        this._clearLogoUploader();
        return;
      }

      let reader = new FileReader();
      reader.readAsDataURL(files[0]);

      reader.onload = (event) => {
        // @ts-ignore
        this.logoPath = event.target.result as string;
        // @ts-ignore
        this.logoFile = files[0];
      };

    }
  }

  private _clearLogoUploader(): void {
    this.logoFile = null;
    this.logoUploader.nativeElement.value = "";
  }

  removeLogo($event: MouseEvent): void {
    $event.preventDefault();
    this.logoPath = '';
    this._clearLogoUploader();
  }

  addArabicBoardMembers(name: string) {
    if (!(CustomValidators.validationPatterns.AR_ONLY.test(name))) {
      return null;
    }
    return name;
  }

  addEnglishBoardMembers(name: string) {
    if (!(CustomValidators.validationPatterns.ENG_ONLY.test(name))) {
      return null;
    }
    return name;
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  private static _changeByteArrayToBase64(fileInfo: FileStore): string {
    return 'data:' + fileInfo.mimeType + ';base64,' + fileInfo.fileContents;
  }

  private _getInvalidTabs(): any {
    let failedList: string[] = [];
    for (const key in this.tabsData) {
      if (!(this.tabsData[key].validStatus())) {
        // @ts-ignore
        failedList.push(this.langService.map[this.tabsData[key].langKey]);
      }
    }
    return failedList;
  }

  destroyPopup(): void {
  }
}
