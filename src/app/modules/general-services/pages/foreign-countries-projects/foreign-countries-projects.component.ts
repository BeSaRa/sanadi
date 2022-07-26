import {
  AfterViewInit,
  Component,
  QueryList,
  TemplateRef,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { CollectionRequestType } from '@app/enums/service-request-types';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { Country } from '@app/models/country';
import { ForeignCountriesProjects } from '@app/models/foreign-countries-projects';
import { ForeignCountriesProjectsResult } from '@app/models/foreign-countries-projects-results';
import { ForeignCountriesProjectsSearchCriteria } from '@app/models/foreign-countries-projects-seach-criteria';
import { Lookup } from '@app/models/lookup';
import { CountryService } from '@app/services/country.service';
import { DialogService } from '@app/services/dialog.service';
import { ForeignCountriesProjectsService } from '@app/services/foreign-countries-projects.service';
import { LangService } from '@app/services/lang.service';
import { LicenseService } from '@app/services/license.service';
import { LookupService } from '@app/services/lookup.service';
import { Observable, of, Subject } from 'rxjs';
import {
  catchError,
  exhaustMap,
  filter,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

@Component({
  selector: 'app-foreign-countries-projects',
  templateUrl: './foreign-countries-projects.component.html',
  styleUrls: ['./foreign-countries-projects.component.scss'],
})
export class ForeignCountriesProjectsComponent
  extends EServicesGenericComponent<
  ForeignCountriesProjects,
  ForeignCountriesProjectsService
  >
  implements AfterViewInit {
  form!: FormGroup;
  tabs: IKeyValue[] = [];
  requestTypes: Lookup[] =
    this.lookupService.listByCategory.CollectionRequestType?.sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  externalCooperations: Lookup[] =
    this.lookupService.listByCategory.ContractLocationType;
  licenseSearch$: Subject<string> = new Subject<string>();
  countries$: Observable<Country[]> = this.countryService
    .loadCountries()
    .pipe(takeUntil(this.destroy$));
  selectedLicense?: ForeignCountriesProjects;

  @ViewChildren('tabContent', { read: TemplateRef })
  tabsTemplates!: QueryList<TemplateRef<any>>;
  constructor(
    public lang: LangService,
    public fb: FormBuilder,
    public service: ForeignCountriesProjectsService,
    private lookupService: LookupService,
    private countryService: CountryService,
    private dialog: DialogService,
    private licenseService: LicenseService
  ) {
    super();
  }
  ngAfterViewInit(): void {
    const tabsTemplates = this.tabsTemplates.toArray();
    setTimeout(() => {
      this.tabs = [
        {
          name: 'basicInfoTab',
          template: tabsTemplates[0],
          title: this.lang.map.lbl_basic_info,
          validStatus: () => this.form && this.basicInfo?.valid,
        },
        {
          name: 'projectNeedsTab',
          template: tabsTemplates[1],
          title: this.lang.map.project_needs,
          validStatus: () => this.form && this.specialExplanation?.valid,
        },
        {
          name: 'specialExplanationsTab',
          template: tabsTemplates[2],
          title: this.lang.map.special_explanations,
          validStatus: () => this.form && this.specialExplanation?.valid,
        },
        {
          name: 'attachmentsTab',
          template: tabsTemplates[tabsTemplates.length - 1],
          title: this.lang.map.attachments,
          validStatus: () => true,
        },
      ];
    }, 0);
  }

  get isEditOrCancel(): boolean {
    return this.isEditRequestType || this.isCancelRequestType;
  }
  get isEditRequestType(): boolean {
    return (
      this.requestTypeField.value &&
      this.requestTypeField.value === CollectionRequestType.UPDATE
    );
  }
  get isCancelRequestType(): boolean {
    return (
      this.requestTypeField.value &&
      this.requestTypeField.value === CollectionRequestType.CANCEL
    );
  }
  get isEditAllowed(): boolean {
    return !this.model?.id || (!!this.model?.id && this.model.canCommit());
  }
  get basicInfo(): FormGroup {
    return this.form.get('basicInfo') as FormGroup;
  }
  get requestTypeField(): FormControl {
    return this.basicInfo?.get('requestType') as FormControl;
  }
  get oldLicenseFullSerialField(): FormControl {
    return this.basicInfo?.get('oldLicenseFullSerial') as FormControl;
  }
  get specialExplanation(): FormGroup {
    return this.form.get('explanation')! as FormGroup;
  }

  licenseSearch($event?: Event): void {
    $event?.preventDefault();
    let value = '';
    if (this.requestTypeField.valid) {
      value = this.oldLicenseFullSerialField.value;
    }
    this.licenseSearch$.next(value);
  }
  loadLicencesByCriteria(
    criteria:
      | Partial<ForeignCountriesProjectsSearchCriteria>
      | Partial<ForeignCountriesProjectsSearchCriteria>
  ): Observable<ForeignCountriesProjectsResult[]> {
    return this.service.licenseSearch(
      criteria as Partial<ForeignCountriesProjectsSearchCriteria>
    );
  }
  listenToLicenseSearch(): void {
    this.licenseSearch$
      .pipe(
        exhaustMap((oldLicenseFullSerial) => {
          return this.loadLicencesByCriteria({
            fullSerial: oldLicenseFullSerial,
          }).pipe(catchError(() => of([])));
        })
      )
      .pipe(
        tap((list) => {
          if (!list.length) {
            this.dialog.info(this.lang.map.no_result_for_your_search_criteria);
          }
        }),
        // allow only the collection if it has value
        filter((result) => !!result.length),
        // switch to the dialog ref to use it later and catch the user response
        switchMap((licenses) => {
          if (licenses.length === 1) {
            return this.licenseService
              .validateLicenseByRequestType(
                this.model!.getCaseType(),
                this.requestTypeField.value,
                licenses[0].id
              )
              .pipe(
                map((data) => {
                  if (!data) {
                    return of(null);
                  }
                  return { selected: licenses[0], details: data };
                }),
                catchError((e) => {
                  return of(null);
                })
              );
          } else {
            const displayColumns = this.service.selectLicenseDisplayColumns;
            return this.licenseService.openSelectLicenseDialog(
              licenses,
              this.model?.clone({
                requestType: this.requestTypeField.value || null,
              }),
              true,
              displayColumns
            ).onAfterClose$;
          }
        }),
        filter<{ selected: any; details: ForeignCountriesProjects }>(
          (selection: { selected: any; details: ForeignCountriesProjects }) => {
            console.log(selection);
            return (
              selection &&
              selection.selected &&
              selection.details instanceof ForeignCountriesProjects
            );
          }
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((selection) => {
        this.setSelectedLicense(selection.details);
      });
  }
  private setSelectedLicense(licenseDetails: ForeignCountriesProjects) {
    this.selectedLicense = licenseDetails;
    let requestType = this.requestTypeField?.value,
      result: Partial<ForeignCountriesProjects> = {
        requestType,
      };

    result.oldLicenseFullSerial = licenseDetails.fullSerial;
    result.country = licenseDetails.country;
    result.description = licenseDetails.description;

    this._updateForm(new ForeignCountriesProjects().clone(result));
  }
  handleRequestTypeChange(
    requestTypeValue: number,
    userInteraction: boolean = false
  ): void {
    if (userInteraction) {
      this._resetForm();
      this.requestTypeField.setValue(requestTypeValue);
    }
    if (!requestTypeValue) {
      requestTypeValue = this.requestTypeField && this.requestTypeField.value;
    }
  }
  getTabInvalidStatus(i: number): boolean {
    if (i >= 0 && i < this.tabs.length) {
      return !this.tabs[i].validStatus();
    }
    return true;
  }
  _getNewInstance(): ForeignCountriesProjects {
    return new ForeignCountriesProjects();
  }
  _initComponent(): void { }
  _buildForm(): void {
    const model = this._getNewInstance();
    this.form = this.fb.group({
      basicInfo: this.fb.group(model.buildForm(true)),
      explanation: this.fb.group(model.buildExplanation(true)),
    });
  }
  _afterBuildForm(): void { }
  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (!this.selectedLicense) {
      this.dialog.error(this.lang.map.please_select_license_to_complete_save);
      return false;
    } else {
      if (saveType === SaveTypes.DRAFT) {
        return true;
      }
      const invalidTabs = this._getInvalidTabs();
      if (invalidTabs.length > 0) {
        const listHtml = CommonUtils.generateHtmlList(
          this.lang.map.msg_following_tabs_valid,
          invalidTabs
        );
        this.dialog.error(listHtml.outerHTML);
        return false;
      } else {
        return true;
      }
    }
  }
  private _getInvalidTabs(): any {
    const failedList: string[] = [];
    for (const tab of this.tabs) {
      if (!tab.validStatus()) {
        failedList.push(tab.title);
      }
    }
    return failedList;
  }
  _beforeLaunch(): boolean | Observable<boolean> {
    throw new Error('Method not implemented.');
  }
  _afterLaunch(): void {
    throw new Error('Method not implemented.');
  }
  _prepareModel():
    | ForeignCountriesProjects
    | Observable<ForeignCountriesProjects> {
    throw new Error('Method not implemented.');
  }
  _afterSave(
    model: ForeignCountriesProjects,
    saveType: SaveTypes,
    operation: OperationTypes
  ): void {
    throw new Error('Method not implemented.');
  }
  _saveFail(error: any): void {
    throw new Error('Method not implemented.');
  }
  _launchFail(error: any): void {
    throw new Error('Method not implemented.');
  }
  _destroyComponent(): void {
    throw new Error('Method not implemented.');
  }
  _updateForm(model: ForeignCountriesProjects | undefined): void {
    throw new Error('Method not implemented.');
  }
  _resetForm(): void {
    this.form.reset();
    this.operation = OperationTypes.CREATE;
  }
}
