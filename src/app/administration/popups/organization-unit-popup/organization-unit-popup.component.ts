import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {OperationTypes} from '../../../enums/operation-types.enum';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FormManager} from '../../../models/form-manager';
import {OrgUnit} from '../../../models/org-unit';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {IDialogData} from '../../../interfaces/i-dialog-data';
import {LookupService} from '../../../services/lookup.service';
import {ToastService} from '../../../services/toast.service';
import {LangService} from '../../../services/lang.service';
import {extender} from '../../../helpers/extender';
import {Lookup} from '../../../models/lookup';
import {LookupCategories} from '../../../enums/lookup-categories';
import {IKeyValue} from '../../../interfaces/i-key-value';
import {CustomValidators} from '../../../validators/custom-validators';
import {of, Subject} from 'rxjs';
import {catchError, exhaustMap, takeUntil} from 'rxjs/operators';
import {IDatePickerDirectiveConfig} from 'ng2-date-picker';
import {ConfigurationService} from '../../../services/configuration.service';
import {IAngularMyDpOptions} from 'angular-mydatepicker';
import {getDatepickerOptions} from '../../../helpers/utils';
import {FileStore} from '../../../models/file-store';
import {DialogService} from '../../../services/dialog.service';

@Component({
  selector: 'app-organization-unit-popup',
  templateUrl: './organization-unit-popup.component.html',
  styleUrls: ['./organization-unit-popup.component.scss']
})
export class OrganizationUnitPopupComponent implements OnInit, OnDestroy {
  private save$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();
  form!: FormGroup;
  fm!: FormManager;
  operation: OperationTypes;
  model: OrgUnit;
  orgUnitTypesList: Lookup[];
  orgUnitStatusList: Lookup[];
  orgUnitsList: OrgUnit[];
  cityList: Lookup[];
  licensingAuthorityList: Lookup[];
  natureOfBusinessList: Lookup[];
  saveVisible = true;
  validateFieldsVisible = true;

  tabsData: IKeyValue = {
    basic: {name: 'basic'},
    advanced: {name: 'advanced'},
    branches: {name: 'branches'}
  };

  dateConfig: IDatePickerDirectiveConfig = {
    format: this.configService.CONFIG.DATEPICKER_FORMAT,
    // disableKeypress: true
  };

  dpOptionsPast: IAngularMyDpOptions = getDatepickerOptions({disablePeriod: 'future'});
  dpOptionsNormal: IAngularMyDpOptions = getDatepickerOptions({disablePeriod: 'none'});

  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  @ViewChild('logoUploader') logoUploader!: ElementRef;
  logoPath: string = '';
  logoFile: any;
  logoExtensions: string[] = this.configService.CONFIG.ORG_LOGO_EXTENSIONS;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<OrgUnit>,
              private lookupService: LookupService,
              private fb: FormBuilder,
              private toast: ToastService,
              public langService: LangService,
              private dialogService: DialogService,
              private configService: ConfigurationService) {
    this.operation = data.operation;
    this.model = data.model;
    this.orgUnitsList = data.orgUnitsList;
    this.orgUnitTypesList = lookupService.getByCategory(LookupCategories.ORG_UNIT_TYPE);
    this.orgUnitStatusList = lookupService.getByCategory(LookupCategories.ORG_STATUS);
    this.cityList = lookupService.listByCategory.Countries;
    this.licensingAuthorityList = lookupService.getByCategory(LookupCategories.LICENSING_AUTHORITY);
    this.natureOfBusinessList = lookupService.getByCategory(LookupCategories.NATURE_OF_BUSINESS);
  }

  ngOnInit(): void {
    this.buildForm();
    this._saveModel();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  setDialogButtonsVisibility(tab: any): void {
    this.saveVisible = !(tab.name && tab.name === this.tabsData.branches.name);
    this.validateFieldsVisible = !(tab.name && tab.name === this.tabsData.branches.name);
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.langService.map.lbl_add_org_unit : this.langService.map.lbl_edit_org_unit;
  }

  private _changeByteArrayToBase64(fileInfo: FileStore): string {
    return 'data:' + fileInfo.mimeType + ';base64,' + fileInfo.fileContents;
  }

  private buildForm(): void {
    this.form = this.fb.group({
      basic: this.fb.group({
        arName: [this.model.arName, [
          CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
          Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')
        ]],
        enName: [this.model.enName, [
          CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
          Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')
        ]],
        orgUnitType: [this.model.orgUnitType, CustomValidators.required],
        orgCode: [{
          value: this.model.orgCode,
          disabled: this.operation
        }, [CustomValidators.required, Validators.maxLength(10)]],
        status: [this.model.status, CustomValidators.required],
        email: [this.model.email, [CustomValidators.required, Validators.email, Validators.maxLength(50)]],
        phoneNumber1: [this.model.phoneNumber1, [
          CustomValidators.required, CustomValidators.number, Validators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)]],
        phoneNumber2: [this.model.phoneNumber2, [
          CustomValidators.number, Validators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)]],
        address: [this.model.address, [Validators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)]],
        buildingName: [this.model.buildingName, [CustomValidators.required, Validators.maxLength(200)]],
        unitName: [this.model.unitName, [CustomValidators.required, Validators.maxLength(200)]],
        street: [this.model.street, [CustomValidators.required, Validators.maxLength(200)]],
        zone: [this.model.zone, [CustomValidators.required, Validators.maxLength(100)]],
        city: [this.model.city, [CustomValidators.required]],
        orgNationality: [this.model.orgNationality, CustomValidators.required],
        poBoxNum: [this.model.poBoxNum, [CustomValidators.number, Validators.maxLength(10)]],
        hotLine: [this.model.hotLine, [CustomValidators.required, CustomValidators.number, Validators.maxLength(10)]],
        faxNumber: [this.model.faxNumber, [CustomValidators.required, CustomValidators.number, Validators.maxLength(10)]],
        registryCreator: [this.model.registryCreator],
        registryDate: [this.model.registryDate, CustomValidators.maxDate(new Date())],
        licensingAuthority: [this.model.licensingAuthority, CustomValidators.required],
        natureOfBusiness: [this.model.natureOfBusiness, CustomValidators.required],
        logo: [this.model.logo]
      }, {
        validators: CustomValidators.validateFieldsStatus([
          'arName', 'enName', 'orgUnitType', 'orgCode', 'status', 'email', 'phoneNumber1', 'phoneNumber2',
          'address', 'buildingName', 'unitName', 'street', 'zone', 'city', 'orgNationality', 'poBoxNum', 'hotLine', 'faxNumber', 'registryCreator',
          'registryDate', 'licensingAuthority', 'natureOfBusiness'
        ])
      }),
      advanced: this.fb.group({
        unifiedEconomicRecord: [this.model.unifiedEconomicRecord, [Validators.maxLength(150)]],
        webSite: [this.model.webSite, [Validators.maxLength(350)]],
        establishmentDate: [this.model.establishmentDate],
        registryNumber: [this.model.registryNumber, [Validators.maxLength(50)]],
        budgetClosureDate: [this.model.budgetClosureDate],
        orgUnitAuditor: [this.model.orgUnitAuditor, [Validators.maxLength(350)]],
        linkToInternalSystem: [this.model.linkToInternalSystem, [Validators.maxLength(450)]],
        lawSubjectedName: [this.model.lawSubjectedName, [Validators.maxLength(450)]],
        boardDirectorsPeriod: [this.model.boardDirectorsPeriod, [Validators.maxLength(350)]],
        arabicBoardMembers: [this.model.arabicBoardMembers],
        enBoardMembers: [this.model.enBoardMembers],
        arabicBrief: [this.model.arabicBrief, [Validators.maxLength(2000)]],
        enBrief: [this.model.enBrief, [Validators.maxLength(2000)]]
      }, {
        validators: CustomValidators.validateFieldsStatus([
          'unifiedEconomicRecord', 'webSite', 'establishmentDate', 'registryNumber', 'budgetClosureDate',
          'orgUnitAuditor', 'linkToInternalSystem', 'lawSubjectedName', 'boardDirectorsPeriod',
          'arabicBoardMembers', 'enBoardMembers', 'arabicBrief', 'enBrief'
        ])
      })
    });
    this.fm = new FormManager(this.form, this.langService);

    if (this.operation === OperationTypes.UPDATE) {
      this.fm.displayFormValidity();

      if (this.model.logo) {
        this.logoPath = this._changeByteArrayToBase64(this.model.logo);
      }
    }
  }

  saveModel(): void {
    this.save$.next();
  }

  _saveModel(): void {
    this.save$.pipe(
      takeUntil(this.destroy$),
      exhaustMap(() => {
        const orgUnit = extender<OrgUnit>(OrgUnit,
          {...this.model, ...this.fm.getForm()?.value.basic, ...this.fm.getForm()?.value.advanced});
        return orgUnit.save().pipe(
          catchError(() => {
            return of(null);
          }));
      })
    ).subscribe((orgUnit) => {
      if (!orgUnit) {
        return;
      }
      const message = (this.operation === OperationTypes.CREATE)
        ? this.langService.map.msg_create_x_success
        : this.langService.map.msg_update_x_success;
      this.toast.success(message.change({x: orgUnit.getName()}));
      this.model = orgUnit;
      this.operation = OperationTypes.UPDATE;
    });
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

      var reader = new FileReader();
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

  saveLogo($event: MouseEvent): void {
    if (!this.model.id || !this.logoFile) {
      return;
    }
    this.model.saveLogo(this.logoFile)
      .subscribe((result: boolean) => {
        this._clearLogoUploader();
        this.toast.success(this.langService.map.msg_update_x_success.change({x: this.langService.map.logo}));
      });
  }

}
