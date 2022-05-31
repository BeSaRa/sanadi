import { EmployeesDataComponent } from "../../shared/employees-data/employees-data.component";
import { LookupEmploymentCategory } from "./../../../enums/lookup-employment-category";
import { LookupService } from "./../../../services/lookup.service";
import { Lookup } from "./../../../models/lookup";
import { IKeyValue } from "@app/interfaces/i-key-value";
import { ILanguageKeys } from "@app/interfaces/i-language-keys";
import { FormManager } from "./../../../models/form-manager";
import { CaseTypes } from "@app/enums/case-types.enum";
import { NavigationService } from "./../../../services/navigation.service";
import { LangService } from "./../../../services/lang.service";
import { JobApplicationService } from "./../../../services/job-application.service";
import { JobApplication } from "./../../../models/job-application";
import { IESComponent } from "./../../../interfaces/iescomponent";
import {
  Component,
  EventEmitter,
  OnInit,
  Input,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { OpenFrom } from "@app/enums/open-from.enum";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { SaveTypes } from "@app/enums/save-types";
import { Subject, BehaviorSubject } from "rxjs";
import { EmploymentRequestType } from "@app/enums/employment-request-type";
import { FileIconsEnum } from "@app/enums/file-extension-mime-types-icons.enum";
import { IGridAction } from "@app/interfaces/i-grid-action";
@Component({
  selector: "app-job-application",
  templateUrl: "./job-application.component.html",
  styleUrls: ["./job-application.component.scss"],
})
export class JobApplicationComponent
  implements OnInit, IESComponent<JobApplication>
{
  fileIconsEnum = FileIconsEnum;
  caseType: number = CaseTypes.JOB_APPLICATION;
  afterSave$: EventEmitter<JobApplication> = new EventEmitter<JobApplication>();
  fromWrapperComponent: boolean = false;
  onModelChange$: EventEmitter<JobApplication | undefined> = new EventEmitter<
    JobApplication | undefined
  >();
  fm!: FormManager;
  accordionView: boolean = false;
  form!: FormGroup;
  save: Subject<SaveTypes> = new Subject<SaveTypes>();
  operation: OperationTypes = OperationTypes.CREATE;
  openFrom: OpenFrom = OpenFrom.ADD_SCREEN;
  @ViewChild("ETable") ETable!: EmployeesDataComponent;
  @Input()
  fromDialog: boolean = false;

  private outModelChange$: BehaviorSubject<JobApplication> =
    new BehaviorSubject<JobApplication>(null as unknown as JobApplication);

  @Input()
  set outModel(model: JobApplication) {
    this.outModelChange$.next(model);
  }

  get outModel(): JobApplication {
    return this.outModelChange$.value;
  }
  readonly: boolean = false;
  allowEditRecommendations: boolean = true;

  EmploymentCategory: Lookup[] =
    this.lookupService.listByCategory.EmploymentCategory.slice().sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  EmploymentRequestType: Lookup[] =
    this.lookupService.listByCategory.EmploymentRequestType.slice().sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  filterdRequestTypeList: Lookup[] =
    this.lookupService.listByCategory.EmploymentRequestType.slice().sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  tabsData: IKeyValue = {
    basicInfo: {
      name: "basicInfoTab",
      langKey: "lbl_basic_info" as keyof ILanguageKeys,
      validStatus: () => this.form.valid,
    },
    employeeInfo: {
      name: "employeeInfoTab",
      langKey: "employee_data",
      validStatus: () => this.form.valid,
    },
    attachments: {
      name: "attachmentsTab",
      langKey: "attachments",
      validStatus: () => true,
    },
  };
  actions: IGridAction[] = [
    {
      langKey: "attachments",
      icon: "attachment",
    },
  ];
  constructor(
    public service: JobApplicationService,
    private navigationService: NavigationService,
    private fb: FormBuilder,
    private lookupService: LookupService,
    public lang: LangService
  ) {}

  ngOnInit() {
    this.buildForm();
  }
  openForm() {
    this.service.openAddNewEmployee();
  }
  private buildForm(): void {
    this.form = this.fb.group(new JobApplication().formBuilder(true));
    this.form.valueChanges.subscribe((data) => {
      console.log(data);
    });
  }

  handleCategoryChange(): void {
    this.requestType.setValue(null);
  }
  handleRequestTypeChange(): void {
    // this._handleIdentificationNumberValidationsByRequestType();
  }
  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  // private _handleIdentificationNumberValidationsByRequestType(): void {
  //   // set validators to empty
  //   this.identificationNumber?.setValidators([]);
  //   this.identificationNumber?.setValue(null);
  //   if (!this.isNewRequestType()) {
  //     this.identificationNumber.setValidators([Validators.required]);
  //   }
  //   this.identificationNumber.updateValueAndValidity();
  // }
  getRequestTypeList() {
    return this.EmploymentRequestType.filter(
      (eqt) =>
        !(
          eqt.lookupKey == EmploymentRequestType.CANCEL &&
          this.category.value == LookupEmploymentCategory.NOTIFICATION
        )
    );
  }
  isNewRequestType(): boolean {
    return (
      this.requestType.value &&
      this.requestType.value === EmploymentRequestType.NEW
    );
  }
  get requestType(): FormControl {
    return this.form.get("requestType") as FormControl;
  }
  get category(): FormControl {
    return this.form.get("category") as FormControl;
  }
  navigateBack(): void {
    this.navigationService.goToBack();
  }
}
