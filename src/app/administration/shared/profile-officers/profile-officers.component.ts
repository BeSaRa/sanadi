import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {DialogService} from '@services/dialog.service';
import {LangService} from '@services/lang.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {Officer} from '@app/models/officer';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'profile-officers',
  templateUrl: './profile-officers.component.html',
  styleUrls: ['./profile-officers.component.scss']
})
export class ProfileOfficersComponent implements OnInit {
  officerForm!: FormGroup;
  @Input() selectedOfficers: Officer[] = [];
  @Input() addLabel!: keyof ILanguageKeys;
  @Output() officerListChanged: EventEmitter<Officer[]> = new EventEmitter<Officer[]>();

  addOfficerFormActive!: boolean;

  selectedOfficer!: Officer | null;
  selectedOfficerIndex!: number | null;

  officersDisplayedColumns: string[] = ['index', 'qId', 'fullName', 'email', 'phone', 'actions'];

  constructor(private dialog: DialogService,
              public lang: LangService,
              private fb: FormBuilder) {
  }

  get fullName(): FormControl {
    return this.officerForm.get('fullName')! as FormControl;
  }

  get qid(): FormControl {
    return this.officerForm.get('qid')! as FormControl;
  }

  ngOnInit(): void {
    this.buildOfficerForm();
  }

  buildOfficerForm(): void {
    this.officerForm = this.fb.group({
      qid: [null, [CustomValidators.required, ...CustomValidators.commonValidations.qId]],
      fullName: [null, [CustomValidators.required, CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]],
      email: [null, [CustomValidators.required, CustomValidators.maxLength(200), CustomValidators.pattern('EMAIL')]],
      phone: [null, [CustomValidators.required, ...CustomValidators.commonValidations.phone]],
      extraPhone: [null, [...CustomValidators.commonValidations.phone]],
    });
  }

  openAddOfficerForm() {
    this.addOfficerFormActive = true;
  }

  selectOfficer(event: MouseEvent, model: Officer) {
    this.addOfficerFormActive = true;
    event.preventDefault();
    this.selectedOfficer = model;
    this.officerForm.patchValue(this.selectedOfficer!);
    this.selectedOfficerIndex = this.selectedOfficers
      .map(x => x.qid).indexOf(model.qid);
  }

  saveOfficer() {
    const officer = new Officer().clone(this.officerForm.getRawValue());
    if (!this.selectedOfficer) {
      if (!this.isExistOfficerInCaseOfAdd(this.selectedOfficers, officer)) {
        this.selectedOfficers = (this.selectedOfficers || []).concat(officer);
        this.resetOfficerForm();
        this.addOfficerFormActive = false;
        this.officerListChanged.emit(this.selectedOfficers);
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    } else {
      if (!this.isExistOfficerInCaseOfEdit(this.selectedOfficers, officer, this.selectedOfficerIndex!)) {
        let newList = this.selectedOfficers.slice();
        newList.splice(this.selectedOfficerIndex!, 1);
        newList.splice(this.selectedOfficerIndex!, 0, officer);
        this.selectedOfficers = newList;
        this.resetOfficerForm();
        this.addOfficerFormActive = false;
        this.officerListChanged.emit(this.selectedOfficers);
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    }
  }

  cancelAddOfficer() {
    this.resetOfficerForm();
    this.addOfficerFormActive = false;
  }

  resetOfficerForm() {
    this.selectedOfficer = null;
    this.selectedOfficerIndex = null;
    this.officerForm.reset();
  }

  removeOfficer(event: MouseEvent, model: Officer) {
    event.preventDefault();
    this.selectedOfficers = this.selectedOfficers.filter(x => x.qid != model.qid);
    this.officerListChanged.emit(this.selectedOfficers);
  }

  isExistOfficerInCaseOfAdd(selectedOfficers: Officer[], toBeAddedOfficer: Officer): boolean {
    return selectedOfficers && selectedOfficers.some(x => x.qid === toBeAddedOfficer.qid);
  }

  isExistOfficerInCaseOfEdit(selectedOfficers: Officer[], toBeEditedOfficer: Officer, selectedIndex: number): boolean {
    for (let i = 0; i < selectedOfficers.length; i++) {
      if (i === selectedIndex) {
        continue;
      }

      if (selectedOfficers[i].qid === toBeEditedOfficer.qid) {
        return true;
      }
    }
    return false;
  }
}
