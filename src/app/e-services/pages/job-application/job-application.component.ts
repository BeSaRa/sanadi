import { IKeyValue } from "@app/interfaces/i-key-value";
import { ILanguageKeys } from "@app/interfaces/i-language-keys";
import { FormManager } from "./../../../models/form-manager";
import { CaseTypes } from "@app/enums/case-types.enum";
import { NavigationService } from "./../../../services/navigation.service";
import { LangService } from "./../../../services/lang.service";
import { JobApplicationService } from "./../../../services/job-application.service";
import { JobApplication } from "./../../../models/job-application";
import { IESComponent } from "./../../../interfaces/iescomponent";
import { Component, EventEmitter, OnInit, Input } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { OpenFrom } from "@app/enums/open-from.enum";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { SaveTypes } from "@app/enums/save-types";
import { Subject, BehaviorSubject } from "rxjs";

@Component({
  selector: "app-job-application",
  templateUrl: "./job-application.component.html",
  styleUrls: ["./job-application.component.scss"],
})
export class JobApplicationComponent
  implements OnInit, IESComponent<JobApplication>
{
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

  constructor(
    public service: JobApplicationService,
    private navigationService: NavigationService,
    private fb: FormBuilder,
    public lang: LangService
  ) {}

  ngOnInit() {
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group({});
    this.fm = new FormManager(this.form, this.lang);
  }
  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }
  navigateBack(): void {
    this.navigationService.goToBack();
  }
}
