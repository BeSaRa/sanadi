import {Component} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {EServicesGenericComponent} from "@app/generics/e-services-generic-component";
import {ProjectImplementation} from "@app/models/project-implementation";
import {LangService} from '@app/services/lang.service';
import {ProjectImplementationService} from "@services/project-implementation.service";
import {Observable,Subject} from 'rxjs';
import {DialogService} from "@services/dialog.service";
import {ToastService} from "@services/toast.service";

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
    selector: 'project-implementation',
    templateUrl: './project-implementation.component.html',
    styleUrls: ['./project-implementation.component.scss']
})
export class ProjectImplementationComponent extends EServicesGenericComponent<ProjectImplementation,ProjectImplementationService> {
    form!: UntypedFormGroup;
    licenseSearch$: Subject<string> = new Subject()
    constructor(public lang: LangService,
                public fb: UntypedFormBuilder,
                public service: ProjectImplementationService,
                public toast: ToastService,
                public dialog: DialogService) {
        super();
    }

    _getNewInstance(): ProjectImplementation {
        return new ProjectImplementation()
    }

    _initComponent(): void {
        // load anything you need it here while initialize the component
    }

    _buildForm(): void {
        const model = new ProjectImplementation()
        // this.form = this.fb.group(model.buildForm(true))
        this.form = this.fb.group({})
    }

    _afterBuildForm(): void {
        this.setDefaultValues()
    }

    _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
        // make sure her that all required field filled with proper values and your form has valid state
        // also for anything ypu need to validate before save happens
        return saveType === SaveTypes.DRAFT ? true : this.form.valid
    }

    _beforeLaunch(): boolean | Observable<boolean> {
        // validate for anything before launch the case
        return this.form.valid
    }

    _afterLaunch(): void {
        this._resetForm()
        this.toast.success(this.lang.map.request_has_been_sent_successfully);
    }

    _prepareModel(): ProjectImplementation | Observable<ProjectImplementation> {
        return new ProjectImplementation().clone({
            ...this.model,
            ...this.form.getRawValue()
        })
    }

    _afterSave(model: ProjectImplementation, saveType: SaveTypes, operation: OperationTypes): void {
        if (
            [OperationTypes.CREATE, OperationTypes.UPDATE].includes(operation) && [SaveTypes.FINAL, SaveTypes.COMMIT].includes(saveType)
        ) {
            this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({serial: model.fullSerial}));
        } else {
            this.toast.success(this.lang.map.request_has_been_saved_successfully);
        }
    }

    _saveFail(error: any): void {
        console.log('Save Fail', error);
    }

    _launchFail(error: any): void {
        console.log('Launch Fail', error);
    }

    _destroyComponent(): void {
    }

    _updateForm(model: ProjectImplementation | undefined): void {
        // this.form.patchValue(model.buildForm())
        this.form.patchValue({})
    }

    _resetForm(): void {
        this.form.reset()
    }

    private setDefaultValues(): void {
        // set default will work only in create a new case
        if (this.operation !== OperationTypes.CREATE) {
            return
        }

    }
    _afterOpenCase(model: ProjectImplementation) {
        // this method will work only if you opened the case for the first time
        // Usually used to load the lookups related to select controllers
    }
}
