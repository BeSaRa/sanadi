import { FormGroup, FormBuilder } from "@angular/forms";
import { LangService } from "@app/services/lang.service";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-employee-form-popup",
  templateUrl: "./employee-form-popup.component.html",
  styleUrls: ["./employee-form-popup.component.scss"],
})
export class EmployeeFormPopupComponent implements OnInit {
  form!: FormGroup;
  constructor(public lang: LangService, private fb: FormBuilder) {}

  ngOnInit() {
    this._buildForm();
  }

  _buildForm() {
    this.form = this.fb.group({});
  }
}
