import {Component, Input, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {OrganizationOfficer} from '@models/organization-officer';
import {EmployeeService} from '@services/employee.service';
import {LangService} from '@services/lang.service';
import {ToastService} from '@services/toast.service';
import {CustomValidators} from '@app/validators/custom-validators';

@Component({
  selector: 'organization-officers',
  templateUrl: './organization-officers.component.html',
  styleUrls: ['./organization-officers.component.scss']
})
export class OrganizationOfficersComponent implements OnInit {
  selectedOfficer!: OrganizationOfficer | null;
  selectedOrganizationOfficers: OrganizationOfficer[] = [];
  laisonOfficers: OrganizationOfficer[] = [];
  selectedOfficerIndex!: number | null;
  organizationOfficerDisplayedColumns: string[] = [
    'fullName',
    'identificationNumber',
    'email',
    'phoneNumber',
    'extraPhoneNumber',
    'actions',
  ];
  officerForm!: UntypedFormGroup;
  @Input() readonly = false;
  @Input() set list(list: OrganizationOfficer[]) {
    this.selectedOrganizationOfficers = list || [];
  }
  get list(): OrganizationOfficer[] {

    return this.selectedOrganizationOfficers;
  }

  constructor(
    private fb: UntypedFormBuilder,
    public lang: LangService,
    private employeeService: EmployeeService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.buildOfficerForm();
  }
  buildOfficerForm(): void {
    this.officerForm = this.fb.group({
      identificationNumber: [
        null,
        [CustomValidators.required].concat(
          CustomValidators.commonValidations.qId
        ),
      ],
      officerFullName: [
        null,
        [
          CustomValidators.required,
          CustomValidators.maxLength(
            CustomValidators.defaultLengths.ENGLISH_NAME_MAX
          ),
        ],
      ],
      email: [
        null,
        [
          CustomValidators.required,
          CustomValidators.maxLength(50),
          CustomValidators.pattern('EMAIL'),
        ],
      ],
      officerPhone: [
        null,
        [CustomValidators.required].concat(
          CustomValidators.commonValidations.phone
        ),
      ],
      officerExtraPhone: [null, CustomValidators.commonValidations.phone],
    });
  }
  mapFormToOrganizationOfficer(form: any): OrganizationOfficer {
    const officer: OrganizationOfficer = new OrganizationOfficer();
    officer.identificationNumber = form.identificationNumber;
    officer.fullName = form.officerFullName;
    officer.email = form.email;
    officer.phone = form.officerPhone;
    officer.extraPhone = form.officerExtraPhone;

    return officer;
  }
  saveOfficer() {
    const officer = this.mapFormToOrganizationOfficer(
      this.officerForm.getRawValue()
    );
    officer.organizationId = this.employeeService.getProfile()?.id!;
    if (!this.selectedOfficer) {
      if (
        this.selectedOrganizationOfficers.findIndex(
          (e) => e.identificationNumber === officer.identificationNumber
        ) === -1
      ) {
        this.selectedOrganizationOfficers =
          this.selectedOrganizationOfficers.concat(officer);
        this.resetOfficerForm();
        return;
      }
      this.toast.error(this.lang.map.selected_item_already_exists);

    }
    else {
      this.selectedOrganizationOfficers.splice(this.selectedOfficerIndex!, 1);
      this.selectedOrganizationOfficers =
        this.selectedOrganizationOfficers.concat(officer);
      this.selectedOfficer = null;
      this.selectedOfficerIndex = null;
      this.resetOfficerForm();
    }
  }
  removeOfficer(event: MouseEvent, model: OrganizationOfficer) {
    event.preventDefault();
    this.selectedOrganizationOfficers =
      this.selectedOrganizationOfficers.filter(
        (x) => x.identificationNumber !== model.identificationNumber
      );
    this.resetOfficerForm();
  }
  resetOfficerForm() {
    this.selectedOfficer = null;
    this.selectedOfficerIndex = null;
    this.officerForm.reset();
  }
  selectOfficer(event: MouseEvent, model: OrganizationOfficer) {
    event.preventDefault();
    this.selectedOfficer = this.mapOrganizationOfficerToForm(model);
    this.officerForm.patchValue(this.selectedOfficer!);
    this.selectedOfficerIndex = this.selectedOrganizationOfficers
      .map((x) => x.identificationNumber)
      .indexOf(model.identificationNumber);
  }
  mapOrganizationOfficerToForm(officer: OrganizationOfficer): any {
    return {
      identificationNumber: officer.identificationNumber,
      officerFullName: officer.fullName,
      email: officer.email,
      officerPhone: officer.phone,
      officerExtraPhone: officer.extraPhone,
    };
  }
  cancel() {
    this.resetOfficerForm();
    this.selectedOfficer = null;
    this.selectedOfficerIndex = null;
  }
}
