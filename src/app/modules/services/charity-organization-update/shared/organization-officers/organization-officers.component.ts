import { Subject } from 'rxjs';
import { ILanguageKeys } from '@contracts/i-language-keys';
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { OrganizationOfficer } from '@models/organization-officer';
import { EmployeeService } from '@services/employee.service';
import { LangService } from '@services/lang.service';
import { ToastService } from '@services/toast.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { DialogService } from '@app/services/dialog.service';
import { OrganizationOfficerPopupComponent } from '../../popups/organization-officer-popup/organization-officer-popup.component';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';

@Component({
  selector: 'organization-officers',
  templateUrl: './organization-officers.component.html',
  styleUrls: ['./organization-officers.component.scss']
})
export class OrganizationOfficersComponent implements OnInit {
  selectedOfficer?: OrganizationOfficer;
  selectedOrganizationOfficers: OrganizationOfficer[] = [];
  laisonOfficers: OrganizationOfficer[] = [];
  add$: Subject<null> = new Subject();
  @Input() label!: string;
  get _label() {
    return this.label as keyof ILanguageKeys
  }
  filterControl: UntypedFormControl = new UntypedFormControl('');
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
  actions: IMenuItem<OrganizationOfficer>[] = [
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_remove',
      onClick: (item: OrganizationOfficer) => this.removeOfficer(item),
      show: (_item: OrganizationOfficer) => !this.readonly
    },
    // select
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: OrganizationOfficer) => this.selectOfficer(item)
    }
  ];
  constructor(
    private fb: UntypedFormBuilder,
    public lang: LangService,
    private employeeService: EmployeeService,
    private toast: ToastService,
    public dialog: DialogService,
  ) { }

  ngOnInit(): void {
    this.buildOfficerForm();
    this.listenToAdd();
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
  openFormDialog() {
    this.dialog.show(
      OrganizationOfficerPopupComponent,
      {
        form: this.officerForm,
        readonly: this.readonly,
        selectedOfficer: this.selectedOfficer,
        label: this.label
      }
    ).onAfterClose$.subscribe((data) => {
      if(data) this.saveOfficer(data)
    })
  }
  listenToAdd() {
    this.add$.subscribe(() => {
      this.openFormDialog();
    })
  }
  saveOfficer(officer: OrganizationOfficer) {
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
      let index = !this.selectOfficer ? -1 : this.selectedOrganizationOfficers.findIndex(x => x == this.selectedOfficer)

      this.selectedOrganizationOfficers.splice(index, 1);
      this.selectedOrganizationOfficers =
        this.selectedOrganizationOfficers.concat(officer);
      this.selectedOfficer = undefined;
      this.resetOfficerForm();
    }
  }
  removeOfficer(model: OrganizationOfficer, event?: MouseEvent) {
    event?.preventDefault();
    this.selectedOrganizationOfficers =
      this.selectedOrganizationOfficers.filter(
        (x) => x.identificationNumber !== model.identificationNumber
      );
    this.resetOfficerForm();
  }
  resetOfficerForm() {
    this.selectedOfficer = undefined;
    this.officerForm.reset();
  }
  selectOfficer(model: OrganizationOfficer, event?: MouseEvent) {
    event?.preventDefault();
    this.selectedOfficer = this.mapOrganizationOfficerToForm(model);
    this.officerForm.patchValue(this.selectedOfficer!);
    this.openFormDialog();
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
    this.selectedOfficer = undefined;
  }
}
