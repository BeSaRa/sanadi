import { Component } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { SaveTypes } from "@app/enums/save-types";
import { ServiceRequestTypes } from "@app/enums/service-request-types";
import { EServicesGenericComponent } from "@app/generics/e-services-generic-component";
import { Fundraising } from "@app/models/fundraising";
import { Lookup } from "@app/models/lookup";
import { FundraisingService } from "@app/services/fundraising.service";
import { LangService } from "@app/services/lang.service";
import { LookupService } from "@app/services/lookup.service";
import { Observable } from "rxjs";

@Component({
  selector: "fundraising",
  templateUrl: "./fundraising.component.html",
  styleUrls: ["./fundraising.component.scss"],
})
export class FundraisingComponent extends EServicesGenericComponent<Fundraising, FundraisingService> {
  form!: FormGroup;

  constructor(
    public lang: LangService,
    public fb: FormBuilder,
    public service: FundraisingService,
    private lookupService: LookupService
  ) {
    super();
  }

  requestTypes: Lookup[] = this.lookupService.listByCategory.ServiceRequestType
    .filter((l) => l.lookupKey !== ServiceRequestTypes.EXTEND)
    .sort((a, b) => a.lookupKey - b.lookupKey);

  requestClassifications: Lookup[] = this.lookupService.listByCategory.CollectionClassification;
  licenseDurationTypes: Lookup[] = this.lookupService.listByCategory.LicenseDurationType;
  
  get basicInfo(): FormGroup {
    return this.form.get('basicInfo')! as FormGroup;
  }

  get specialExplanation(): FormGroup {
    return this.form.get('explanation')! as FormGroup;
  }

  _getNewInstance(): Fundraising {
    return new Fundraising();
  }

  _initComponent(): void {
    // throw new Error('Method not implemented.');
  }

  _buildForm(): void {
    const model = new Fundraising();
    this.form = this.fb.group({
      basicInfo: this.fb.group(model.buildBasicInfo(true)),
      explanation: this.fb.group(model.buildExplanation(true))
    })
  }

  _afterBuildForm(): void {
    // Never direct implement anything here; rather create a function and call it from here
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    throw new Error("Method not implemented.");
  }
  _beforeLaunch(): boolean | Observable<boolean> {
    throw new Error("Method not implemented.");
  }
  _afterLaunch(): void {
    throw new Error("Method not implemented.");
  }
  _prepareModel(): Fundraising | Observable<Fundraising> {
    throw new Error("Method not implemented.");
  }
  _afterSave(
    model: Fundraising,
    saveType: SaveTypes,
    operation: OperationTypes
  ): void {
    throw new Error("Method not implemented.");
  }
  _saveFail(error: any): void {
    throw new Error("Method not implemented.");
  }
  _launchFail(error: any): void {
    throw new Error("Method not implemented.");
  }
  _destroyComponent(): void {
    // throw new Error('Method not implemented.');
  }
  _updateForm(model: Fundraising | undefined): void {
    throw new Error("Method not implemented.");
  }
  _resetForm(): void {
    throw new Error("Method not implemented.");
  }
}
