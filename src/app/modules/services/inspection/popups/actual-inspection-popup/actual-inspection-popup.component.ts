import { AfterViewInit, Component, Inject } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ActualInspectionCreationSource } from '@app/enums/actual-inspection-creation-source.enum';
import { LinkedProjectTypes } from '@app/enums/linked-project-type.enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { TaskAreas } from '@app/enums/task-areas.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { DateUtils } from '@app/helpers/date-utils';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ActualInspection } from '@app/models/actual-inspection';
import { BaseModel } from '@app/models/base-model';
import { Country } from '@app/models/country';
import { ExternalUser } from '@app/models/external-user';
import { InspectionOperation } from '@app/models/inspection-operation';
import { InternalDepartment } from '@app/models/internal-department';
import { InternalUser } from '@app/models/internal-user';
import { Lookup } from '@app/models/lookup';
import { Profile } from '@app/models/profile';
import { CountryService } from '@app/services/country.service';
import { EmployeeService } from '@app/services/employee.service';
import { InspectionOperationService } from '@app/services/inspection-operation.service';
import { InternalDepartmentService } from '@app/services/internal-department.service';
import { InternalUserService } from '@app/services/internal-user.service';
import { LangService } from '@app/services/lang.service';
import { LicenseActivityService } from '@app/services/license-activity.service';
import { LookupService } from '@app/services/lookup.service';
import { ProfileService } from '@app/services/profile.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { DatepickerControlsMap, DatepickerOptionsMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { IMyInputFieldChanged } from 'angular-mydatepicker';
import { Observable, Subject, of } from 'rxjs';
import { filter, map, scan, startWith, takeUntil, tap } from 'rxjs/operators';

@Component({
    selector: 'actual-inspection-popup',
    templateUrl: 'actual-inspection-popup.component.html',
    styleUrls: ['actual-inspection-popup.component.scss']
})
export class ActualInspectionPopupComponent extends AdminGenericDialog<ActualInspection> {

    form!: UntypedFormGroup;
    model!: ActualInspection;
    operation: OperationTypes;
    saveVisible = true;
    departmentsList$: Observable<InternalDepartment[]> = new Observable<InternalDepartment[]>;
    countries$: Observable<Country[]> = new Observable<Country[]>;
    private qatarCountry?: Country;
    creationSource: ActualInspectionCreationSource = ActualInspectionCreationSource.ACTUAL_TASK_SOURCE;


    ActualInspectionTaskTypes: Lookup[] = this.lookupService.listByCategory.ActualInspectionTaskType;
    taskNatures: Lookup[] = this.lookupService.listByCategory.TaskNature;
    taskAreas: Lookup[] = this.lookupService.listByCategory.TaskArea;
    taskAUnknownOrganizations: Lookup[] = this.lookupService.listByCategory.UnknownOrganization;
    YesNo: Lookup[] = this.lookupService.listByCategory.LinkedProject;
    relations: Lookup[] = this.lookupService.listByCategory.Relation;
    inspectionOperations: InspectionOperation[] = [];
    mainInspectionOperations: InspectionOperation[] = [];
    subInspectionOperations: InspectionOperation[] = [];
    profiles$: Observable<Profile[]> = new Observable<Profile[]>
    inspectors$: Observable<InternalUser[]> = new Observable<InternalUser[]>
    priorities: Lookup[] = this.lookupService.listByCategory.PriorityType
    readonly: boolean = false;
    unKnownToggle$: Subject<void> = new Subject()
    unKnownState$ = this.unKnownToggle$.pipe(
        scan((state, _) => !state, false),
        startWith(false)
    )
    constructor(public dialogRef: DialogRef,
        public fb: UntypedFormBuilder,
        public lang: LangService,
        @Inject(DIALOG_DATA_TOKEN) data: IDialogData<ActualInspection> & { creationSource: ActualInspectionCreationSource },
        private toast: ToastService,
        private internalDepartmentService: InternalDepartmentService,
        private lookupService: LookupService,
        private employeeService: EmployeeService,
        private inspectionOperationService: InspectionOperationService,
        private profileService: ProfileService,
        private countryService: CountryService,
        private internalUserService: InternalUserService,
        // don't remove this because its required for DI registration
        private licenseActivityService: LicenseActivityService) {
        super();
        this.model = data.model;
        this.operation = data.operation;
        data.creationSource && (this.creationSource = data.creationSource);
    }
    datepickerOptionsMap: DatepickerOptionsMap = {};
    datepickerControlsMap: DatepickerControlsMap = {};

    initPopup(): void {
        this.inspectionOperationService.loadAsLookups()
            .pipe(
                tap((operations) => {
                    this.inspectionOperations = operations;
                    this.mainInspectionOperations = operations
                    .filter(item => item.parentId === null && (!!this.departmentIdControl.value ? item.departmentId === this.departmentIdControl.value : true))
                    this.model.mainOperationType &&
                    (
                        this.subInspectionOperations = this.inspectionOperations.filter(item => item.parentId === this.model.mainOperationType)
                    )
                })
            )
            .subscribe();
        this.profiles$ = this.profileService.loadActive()
        this.countries$ = this.countryService.loadActive().pipe(
            map((countries) => countries.sort((a, b) => a.getName() > b.getName() ? 1 : -1)),
            tap((countries) =>
                this.qatarCountry = countries.find(country => country.enName.toLowerCase() === 'qatar'))
        )
        this.inspectors$ = this.internalUserService.getInspectors();
        this._buildDatePickerMap();
        this._buildDatepickerControlsMap();

    }

    buildForm(): void {
        this.form = this.fb.group(this.model.buildForm(true));
        this._listenToMainOperationTypeChange();
        this.departmentsList$ = this.internalDepartmentService.loadAsLookups()
        .pipe(
            tap(list =>{
                const department = list.find(item => item.id === this.employeeService.getInternalDepartment()!.id)
                department && (this.departmentIdControl.setValue(department.id) );
                this.mainOperationTypeControl.setValue(this.model.mainOperationType)
                this.subOperationTypeControl.setValue(this.model.subOperationType)
            }),
            filter(department => !!department),
            takeUntil(this.destroy$),
        )

        if (this.operation === OperationTypes.VIEW) {
            this.form.disable();
            this.saveVisible = false;
            this.validateFieldsVisible = false;
            this.readonly = true;
        }
        this._listenToDepartmentIdChange();
        this._listenToUnknownState();
        this._listenToTaskAreaChange();
        this._moneyLaundryOrTerrorismChange();
        this._setDefaultValues();
        if(this.readonly){
            this.inspectionSpecialistsArray.disable();
            this.licenseActivitiesArray.disable();
        }else{
            this.inspectionSpecialistsArray.enable();
            this.licenseActivitiesArray.enable();
        }
    }
    private _setDefaultValues() {
       
        if(this.moneyLaundryOrTerrorismControl.value !== LinkedProjectTypes.YES ){

            this.relationControl.disable();
        }
     
    }

    private _listenToDepartmentIdChange(){
        this.departmentIdControl.valueChanges
        .pipe(
            filter(departmentId =>!!departmentId),
            tap(departmentId => {
                this.mainOperationTypeControl.reset();
                this.subOperationTypeControl.reset();
                this.mainInspectionOperations = this.inspectionOperations.filter(item =>item.parentId === null && item.departmentId === departmentId);
                this.subInspectionOperations= [];
            }),
            takeUntil(this.destroy$)
        ).subscribe()
    }
    private _moneyLaundryOrTerrorismChange() {
        this.moneyLaundryOrTerrorismControl.valueChanges
            .pipe(
                tap((value) => {
                    this.relationControl.setValue(null);
                    if (value === LinkedProjectTypes.YES) {
                        this.relationControl.enable();
                    } else {
                        this.relationControl.disable();
                    }
                }),
                takeUntil(this.destroy$)
            ).subscribe()

    }

    beforeSave(model: ActualInspection, form: UntypedFormGroup): Observable<boolean> | boolean {
        return form.valid;
    }

    prepareModel(model: ActualInspection, form: UntypedFormGroup): Observable<ActualInspection> | ActualInspection {
        return (new ActualInspection()).clone({
            ...model, ...form.value,
            createdby: this.employeeService.getCurrentUser().generalUserId,
            creationSource: this.creationSource
        });
    }

    afterSave(model: ActualInspection, dialogRef: DialogRef): void {
        const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
        this.toast.success(message.change({ x: this.lang.map.lbl_actual_inspection }));
        this.model = model;
        this.operation = OperationTypes.UPDATE;
        dialogRef.close(model);
    }

    saveFail(error: Error): void {
    }
    onDateChange(
        event: IMyInputFieldChanged,
        fromFieldName: string,
        toFieldName: string
    ): void {
        DateUtils.setRelatedMinMaxDate({
            fromFieldName,
            toFieldName,
            controlOptionsMap: this.datepickerOptionsMap,
            controlsMap: this.datepickerControlsMap,
        });
    }
    get popupTitle(): string {
        if (this.operation === OperationTypes.UPDATE) {
            return this.lang.map.lbl_edit_actual_inspection;
        } else if (this.operation === OperationTypes.VIEW) {
            return this.lang.map.view;
        } else if (this.operation === OperationTypes.CREATE) {
            return this.lang.map.lbl_create_actual_inspection;
        }
        return '';
    };

    get departmentIdControl(): UntypedFormControl {
        return this.form.get('departmentId') as UntypedFormControl;
    }
    get mainOperationTypeControl(): UntypedFormControl {
        return this.form.get('mainOperationType') as UntypedFormControl;
    }
    get subOperationTypeControl(): UntypedFormControl {
        return this.form.get('subOperationType') as UntypedFormControl;
    }
    get knownOrgIdControl(): UntypedFormControl {
        return this.form.get('knownOrgId') as UntypedFormControl;
    }
    get unknownOrgTypeControl(): UntypedFormControl {
        return this.form.get('unknownOrgType') as UntypedFormControl;
    }
    get unknownOrgNameControl(): UntypedFormControl {
        return this.form.get('unknownOrgName') as UntypedFormControl;
    }
    get unknownOrgOtherDataControl(): UntypedFormControl {
        return this.form.get('unknownOrgOtherData') as UntypedFormControl;
    }
    get unknownOrgEmailControl(): UntypedFormControl {
        return this.form.get('unknownOrgEmail') as UntypedFormControl;
    }
    get dateFromControl(): UntypedFormControl {
        return this.form.get('dateFrom') as UntypedFormControl;
    }
    get dateToControl(): UntypedFormControl {
        return this.form.get('dateTo') as UntypedFormControl;
    }
    get taskAreaControl(): UntypedFormControl {
        return this.form.get('taskArea') as UntypedFormControl;
    }
    get countryIdControl(): UntypedFormControl {
        return this.form.get('countryId') as UntypedFormControl;
    }
    get moneyLaundryOrTerrorismControl(): UntypedFormControl {
        return this.form.get('moneyLaundryOrTerrorism') as UntypedFormControl;
    }
    get relationControl(): UntypedFormControl {
        return this.form.get('relation') as UntypedFormControl;
    }
    get licenseActivitiesArray(): UntypedFormArray {
        return this.form.get('licenseActivities') as UntypedFormArray;
    }
    get inspectionSpecialistsArray(): UntypedFormArray {
        return this.form.get('inspectionSpecialists') as UntypedFormArray;
    }
    destroyPopup(): void {
    }

    isProposedInspection(): boolean {
        return this.creationSource === ActualInspectionCreationSource.PROPOSED_TASK_SOURCE
    }

    private _listenToTaskAreaChange() {
        this.taskAreaControl.valueChanges.pipe(
            takeUntil(this.destroy$),
            tap((value: TaskAreas) => {
                if (value === TaskAreas.Internal) {
                    this.countryIdControl.setValue(this.qatarCountry?.id);
                    this.countryIdControl.disable();
                } else {
                    this.countryIdControl.setValue(null);
                    this.countryIdControl.enable();
                }
            })
        ).subscribe()
    }
    private _listenToUnknownState() {
        this.unKnownState$.pipe(
            tap((state) => {
                const knownOrgFields = [this.knownOrgIdControl];
                const unKnownOrgFields = [this.unknownOrgTypeControl, this.unknownOrgNameControl,
                this.unknownOrgEmailControl, this.unknownOrgOtherDataControl];
                if (state) {
                    this._clearFieldsValidators(knownOrgFields)
                    this._setUnKnownFieldsValidators();
                } else {

                    this._clearFieldsValues(unKnownOrgFields);
                    this._clearFieldsValidators(unKnownOrgFields);
                    this.knownOrgIdControl.setValidators(CustomValidators.required);
                    this.knownOrgIdControl.updateValueAndValidity();
                }
            }),
            takeUntil(this.destroy$)
        ).subscribe();
    }
    private _clearFieldsValidators(fields: UntypedFormControl[]) {
        fields.forEach(field => {
            field.clearValidators();

            field.updateValueAndValidity();
        })
    }
    private _clearFieldsValues(fields: UntypedFormControl[]) {
        fields.forEach(field => {
            field.setValue(null);
        })
    }
    private _setUnKnownFieldsValidators() {
        this.unknownOrgTypeControl.setValidators(CustomValidators.required);

        this.unknownOrgNameControl.setValidators(
            [CustomValidators.required,
            CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)
            ]);
        this.unknownOrgOtherDataControl.setValidators(
            [CustomValidators.required,
            CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)
            ])

        this.unknownOrgEmailControl.setValidators(
            [CustomValidators.pattern('EMAIL'),
            CustomValidators.maxLength(CustomValidators.defaultLengths.EMAIL_MAX)
            ]
        )
        this.unknownOrgTypeControl.updateValueAndValidity();
        this.unknownOrgNameControl.updateValueAndValidity();
        this.unknownOrgOtherDataControl.updateValueAndValidity();
        this.unknownOrgEmailControl.updateValueAndValidity();
    }
    private _listenToMainOperationTypeChange() {
        this.mainOperationTypeControl.valueChanges
            .pipe(
                filter(type=>!!type),
                tap((type: number) => {
                    this.subInspectionOperations = this.inspectionOperations.filter(item => item.parentId === type);
                }),
                takeUntil(this.destroy$)
            )
            .subscribe()
    }
    private _buildDatepickerControlsMap(): void {
        this.datepickerControlsMap = {
            dateFrom: this.dateFromControl,
            dateTo: this.dateToControl,
        }
    }
    private _buildDatePickerMap() {
        this.datepickerOptionsMap = {
            dateFrom: DateUtils.getDatepickerOptions({
                disablePeriod: 'past',
            }),
            dateTo: DateUtils.getDatepickerOptions({
                disablePeriod: 'past',
            }),
        };
    }

}



