import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { CharityBranch } from '@app/models/charity-branch';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';



@Component({
  selector: 'charity-branch',
  templateUrl: './charity-branch.component.html',
  styleUrls: ['./charity-branch.component.scss']
})
export class CharityBranchComponent implements OnInit {
  form!: UntypedFormGroup;
  @Input() readonly!: boolean;
  constructor(public lang: LangService, private lookupService: LookupService, private fb: UntypedFormBuilder) { }

  controls = [
    { controlName: 'fullName', label: this.lang.map.full_name },
    { controlName: 'category', label: this.lang.map.type, load: this.lookupService.listByCategory.CharityRequestType },
    { controlName: 'branchAdjective', label: this.lang.map.branch_adjective, load: this.lookupService.listByCategory.CharityRequestType },
    { controlName: 'usageAdjective', label: this.lang.map.usage_adjective, load: this.lookupService.listByCategory.CharityRequestType },
    { controlName: 'address', label: this.lang.map.lbl_address },
    { controlName: 'streetNumber', label: this.lang.map.lbl_street },
    { controlName: 'buildingNumber', label: this.lang.map.building_number },
    { controlName: 'zoneNumber', label: this.lang.map.lbl_zone },

  ];
  _list: CharityBranch[] = [];
  columns = ['fullName', 'address', 'streetNumber', 'zoneNumber', 'buildingNumber'];


  ngOnInit(): void {
    const model = new CharityBranch();
    this.form = this.fb.group(model.buildForm());
  }

}
