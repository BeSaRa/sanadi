import {Component, Inject, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {LangService} from '@app/services/lang.service';
import {DialogRef} from '../../models/dialog-ref';
import {ToastService} from '@app/services/toast.service';
import {EmployeeService} from '@app/services/employee.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {AdminResult} from '@app/models/admin-result';
import {Recommendation} from '@app/models/recommendation';
import {RecommendationService} from '@app/services/recommendation.service';

@Component({
  selector: 'recommendation-popup',
  templateUrl: './recommendation-popup.component.html',
  styleUrls: ['./recommendation-popup.component.scss']
})
export class RecommendationPopupComponent implements OnInit {
  model?: Recommendation;
  service: RecommendationService;
  caseId: string;
  form!: UntypedFormGroup;
  customValidators = CustomValidators;

  get recommendation(): string {
    return this.form.get('text')?.value || '';
  };

  constructor(
    @Inject(DIALOG_DATA_TOKEN) data: { comment: Recommendation, caseId: string, service: RecommendationService },
    public lang: LangService,
    public fb: UntypedFormBuilder,
    private dialogRef: DialogRef,
    private toast: ToastService,
    private employeeService: EmployeeService
  ) {
    this.service = data.service;
    this.caseId = data.caseId;
  }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(): void {
    this.form = this.fb.group({
      text: [null, [CustomValidators.required, CustomValidators.minLength(4)]]
    });
  }

  saveRecommendation(): void {
    if (this.form.invalid) {
      return;
    }
    this.prepareRecommendation();
    this.caseId ? this.saveRecommendationByApi() : this.saveRecommendationByClient();
  }

  private prepareRecommendation(): void {
    const employee = this.employeeService.getCurrentUser();
    this.model = (new Recommendation()).clone({
      text: this.recommendation,
      creatorInfo: AdminResult.createInstance({
        arName: employee.arName,
        enName: employee.enName
      })
    });
  }

  private saveRecommendationByApi(): void {
    this.service
      .create(this.caseId, this.model!)
      .subscribe(recommendation => {
        this.toast.success(this.lang.map.recommendation_has_been_saved_successfully);
        this.dialogRef.close(recommendation);
      });
  }

  private saveRecommendationByClient(): void {
    this.toast.success(this.lang.map.recommendation_has_been_saved_successfully);
    this.dialogRef.close(this.model);
  }
}
