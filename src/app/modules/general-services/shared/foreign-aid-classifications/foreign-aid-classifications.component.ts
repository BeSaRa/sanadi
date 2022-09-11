import { Component, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { DomainTypes } from '@app/enums/domain-types';
import { ListModelComponent } from '@app/generics/ListModel-component';
import { ControlWrapper } from '@app/interfaces/i-control-wrapper';
import { ForeignAidClassification } from '@app/models/foreign-aid-classification';
import { AdminLookupService } from '@app/services/admin-lookup.service';
import { DacOchaNewService } from '@app/services/dac-ocha-new.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { Observable } from 'rxjs';

@Component({
  selector: 'foreign-aid-classifications',
  templateUrl: './foreign-aid-classifications.component.html',
  styleUrls: ['./foreign-aid-classifications.component.scss'],
})
export class ForeignAidClassificationsComponent extends ListModelComponent<ForeignAidClassification> {
  handleGoveranceDomainChange = (id: number | string) => {
    console.log(id);
    console.log(this.baseControls);
    if (id === DomainTypes.DEVELOPMENT) {
      this.controls = [...this.baseControls, ...this.developmentControls];
      this.form = this.fb.group({
        governanceDomain: [
          id,
          [CustomValidators.required],
        ],
        mainDACCategory: [
          this.model.mainDACCategory,
          [CustomValidators.required],
        ],
        subDACCategory: [
          this.model.subDACCategory,
          [CustomValidators.required],
        ],
      });
    } else {
      this.controls = [...this.baseControls, ...this.humanitirianControls];
      this.form = this.fb.group({
        governanceDomain: [
          id,
          [CustomValidators.required],
        ],
        mainUNOCHACategory: [
          this.model.mainUNOCHACategory,
          [CustomValidators.required],
        ],
        subUNOCHACategory: [
          this.model.subUNOCHACategory,
          [CustomValidators.required],
        ],
      });
    }
  };
  constructor(
    private fb: UntypedFormBuilder,
    private lookupService: LookupService,
    public lang: LangService,
    private adminLookupService: AdminLookupService,
    private dacOchaNewService: DacOchaNewService
  ) {
    super(ForeignAidClassification);
  }
  @Input() set list(_list: ForeignAidClassification[]) {
    this._list = _list;
  }
  @Input() readonly!: boolean;
  form!: UntypedFormGroup;

  baseControls: ControlWrapper[] = [
    {
      controlName: 'governanceDomain',
      type: 'dropdown',
      load: this.lookupService.listByCategory.Domain,
      label: this.lang.map.domain,
      dropdownValue: 'lookupKey',
      onChange: this.handleGoveranceDomainChange,
    },
  ];
  controls = this.baseControls;
  private handleOCHAOrDAC = (id: string | number) => {
    this.controls[2].load$ = this.dacOchaNewService.loadByParentId(id as number);
  }
  developmentControls: ControlWrapper[] = [
    {
      controlName: 'mainDACCategory',
      type: 'dropdown',
      load$: this.dacOchaNewService.loadByType(AdminLookupTypeEnum.DAC),
      label: this.lang.map.classification_of_DAC,
      dropdownValue: 'id',
      onChange: this.handleOCHAOrDAC
    },
    {
      controlName: 'subDACCategory',
      type: 'dropdown',
      load$: this.dacOchaNewService.loadByParentId(-1),
      label: this.lang.map.DAC_subclassification,
      dropdownValue: 'id',
    },
  ];
  humanitirianControls: ControlWrapper[] = [
    {
      controlName: 'mainUNOCHACategory',
      type: 'dropdown',
      load$: this.dacOchaNewService.loadByType(AdminLookupTypeEnum.OCHA),
      label: this.lang.map.OCHA_main_classification,
      dropdownValue: 'id',
      onChange: this.handleOCHAOrDAC

    },
    {
      controlName: 'subUNOCHACategory',
      type: 'dropdown',
      load$: this.dacOchaNewService.loadByParentId(-1),
      label: this.lang.map.OCHA_subclassification,
      dropdownValue: 'id',
    },
  ];
  columns = ['actions'];

  protected _initComponent(): void {
    this.form = this.fb.group({
      governanceDomain: [
        this.model.governanceDomain,
        [CustomValidators.required],
      ],
    });
  }
}
