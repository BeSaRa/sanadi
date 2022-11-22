import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {DialogService} from '@services/dialog.service';
import {LangService} from '@services/lang.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {Branch} from '@app/models/branch';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@services/lookup.service';
import {CharityOrganizationProfileExtraDataService} from '@services/charity-organization-profile-extra-data.service';
import {DialogRef} from '@app/shared/models/dialog-ref';

@Component({
  selector: 'profile-branches',
  templateUrl: './profile-branches.component.html',
  styleUrls: ['./profile-branches.component.scss']
})
export class ProfileBranchesComponent implements OnInit {
  branchForm!: FormGroup;
  @Input() selectedBranches: Branch[] = [];
  @Output() branchListChanged: EventEmitter<Branch[]> = new EventEmitter<Branch[]>();

  categories: Lookup[] = this.lookupService.listByCategory.BranchCategory
    .sort((a, b) => a.lookupKey - b.lookupKey);

  branchAdjectives: Lookup[] = this.lookupService.listByCategory.BranchAdjective
    .sort((a, b) => a.lookupKey - b.lookupKey);

  usageAdjectives: Lookup[] = this.lookupService.listByCategory.UsageAdjective
    .sort((a, b) => a.lookupKey - b.lookupKey);

  addBranchFormActive!: boolean;
  selectedBranch!: Branch | null;
  selectedBranchIndex!: number | null;

  branchesDisplayedColumns: string[] = ['index', 'fullName', 'zoneNumber', 'streetNumber', 'buildingNumber', 'actions'];

  constructor(private dialog: DialogService,
              public lang: LangService,
              private fb: FormBuilder,
              private lookupService: LookupService,
              private charityOrgProfileExtraDataService: CharityOrganizationProfileExtraDataService) {
  }

  get fullName(): FormControl {
    return this.branchForm.get('fullName')! as FormControl;
  }

  ngOnInit(): void {
    this.buildBranchForm();
  }

  buildBranchForm(): void {
    this.branchForm = this.fb.group({
      fullName: [null, [CustomValidators.required, CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]],
      category: [null, [CustomValidators.required]],
      branchAdjective: [null, [CustomValidators.required]],
      usageAdjective: [null, [CustomValidators.required]],
      zoneNumber: [null, [CustomValidators.required, CustomValidators.maxLength(5)]],
      streetNumber: [null, [CustomValidators.required, CustomValidators.maxLength(5)]],
      buildingNumber: [null, [CustomValidators.required, CustomValidators.maxLength(5)]],
      address: [null, [CustomValidators.required, CustomValidators.maxLength(512)]]
    });
  }

  openAddBranchForm() {
    this.addBranchFormActive = true;
  }

  selectBranch(event: MouseEvent, model: Branch) {
    this.addBranchFormActive = true;
    event.preventDefault();
    this.selectedBranch = model;
    this.branchForm.patchValue(this.selectedBranch!);
    this.selectedBranchIndex = this.selectedBranches
      .map(x => x.fullName).indexOf(model.fullName);
  }

  saveBranch() {
    const branch = new Branch().clone(this.branchForm.getRawValue());
    if (!this.selectedBranch) {
      if (!this.isExistBranchInCaseOfAdd(this.selectedBranches, branch)) {
        this.selectedBranches = (this.selectedBranches || []).concat(branch);
        this.resetBranchForm();
        this.addBranchFormActive = false;
        this.branchListChanged.emit(this.selectedBranches);
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    } else {
      if (!this.isExistBranchInCaseOfEdit(this.selectedBranches, branch, this.selectedBranchIndex!)) {
        let newList = this.selectedBranches.slice();
        newList.splice(this.selectedBranchIndex!, 1);
        newList.splice(this.selectedBranchIndex!, 0, branch);
        this.selectedBranches = newList;
        this.resetBranchForm();
        this.addBranchFormActive = false;
        this.branchListChanged.emit(this.selectedBranches);
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    }
  }

  cancelAddBranch() {
    this.resetBranchForm();
    this.addBranchFormActive = false;
  }

  resetBranchForm() {
    this.selectedBranch = null;
    this.selectedBranchIndex = null;
    this.branchForm.reset();
  }

  removeBranch(event: MouseEvent, model: Branch) {
    event.preventDefault();
    this.selectedBranches = this.selectedBranches.filter(x => x.fullName != model.fullName);
    this.branchListChanged.emit(this.selectedBranches);
  }

  isExistBranchInCaseOfAdd(selectedBranches: Branch[], toBeAddedBranch: Branch): boolean {
    return selectedBranches && selectedBranches.some(x => x.fullName === toBeAddedBranch.fullName);
  }

  isExistBranchInCaseOfEdit(selectedBranches: Branch[], toBeEditedBranch: Branch, selectedIndex: number): boolean {
    for (let i = 0; i < selectedBranches.length; i++) {
      if (i === selectedIndex) {
        continue;
      }

      if (selectedBranches[i].fullName === toBeEditedBranch.fullName) {
        return true;
      }
    }
    return false;
  }

  manageContactOfficers(event: MouseEvent, model: Branch) {
    event.preventDefault();
    this.charityOrgProfileExtraDataService.openBranchContactOfficersDialog(model).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe(item => {
        if (item) {
          this.selectedBranches.find(x => x.fullName === item.fullName)!.branchContactOfficerList = item.branchContactOfficerList;
          this.branchListChanged.emit(this.selectedBranches);
          console.log('returned item', item);
        }
      });
    });
  }
}
