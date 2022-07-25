import { Component, Inject, OnInit } from '@angular/core';
import { Employment } from "@app/models/employment";
import { DIALOG_DATA_TOKEN } from "@app/shared/tokens/tokens";

@Component({
  selector: 'employment-approve',
  templateUrl: './employment-approve.component.html',
  styleUrls: ['./employment-approve.component.scss']
})
export class EmploymentApproveComponent implements OnInit {

  constructor(@Inject(DIALOG_DATA_TOKEN) public model: Employment) {
    console.log(model);
  }

  ngOnInit(): void {

  }

}
