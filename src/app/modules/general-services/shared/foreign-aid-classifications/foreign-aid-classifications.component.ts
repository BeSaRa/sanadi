import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {AdminLookupTypeEnum} from '@app/enums/admin-lookup-type-enum';
import {CharityWorkArea} from '@app/enums/charity-work-area.enum';
import {DomainTypes} from '@app/enums/domain-types';
import {ListModelComponent} from '@app/generics/ListModel-component';
import {ControlWrapper} from '@app/interfaces/i-control-wrapper';
import {ForeignAidClassification} from '@app/models/foreign-aid-classification';
import {AidLookupService} from '@app/services/aid-lookup.service';
import {DacOchaService} from '@services/dac-ocha.service';
import {LangService} from '@app/services/lang.service';
import {LookupService} from '@app/services/lookup.service';
import {CustomValidators} from '@app/validators/custom-validators';

@Component({
  selector: 'foreign-aid-classifications',
  templateUrl: './foreign-aid-classifications.component.html',
  styleUrls: ['./foreign-aid-classifications.component.scss'],
})
export class ForeignAidClassificationsComponent
  extends ListModelComponent<ForeignAidClassification>
  implements OnChanges {
  get list() {
    return this._list;
  }

  handleGoveranceDomainChange = (id: number | string) => {
    if (id === DomainTypes.DEVELOPMENT) {
      this.controls = [...this.baseControls, ...this.developmentControls];
      this.form = this.fb.group({
        domain: [id, [CustomValidators.required]],
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
        domain: [id, [CustomValidators.required]],
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
    private aidService: AidLookupService,
    private dacOchaService: DacOchaService
  ) {
    super(ForeignAidClassification);
  }
  @Input() set list(_list: ForeignAidClassification[]) {
    this._list = _list;
  }
  @Input() readonly!: boolean;
  @Input() charityWorkArea!: number;
  form!: UntypedFormGroup;

  baseControls: ControlWrapper[] = [
    {
      controlName: 'domain',
      type: 'dropdown',
      load: this.lookupService.listByCategory.Domain,
      label: this.lang.map.domain,
      dropdownValue: 'lookupKey',
      onChange: this.handleGoveranceDomainChange,
    },
  ];
  controls = this.baseControls;
  private handleOCHAOrDAC = (id: string | number) => {
    const addOne = this.charityWorkArea === CharityWorkArea.BOTH ? 1 : 0;
    this.controls[2 + addOne].load$ = this.dacOchaService.loadByParentId(
      id as number
    );
  };
  developmentControls: ControlWrapper[] = [
    {
      controlName: 'mainDACCategory',
      type: 'dropdown',
      load$: this.dacOchaService.loadByType(AdminLookupTypeEnum.DAC),
      label: this.lang.map.classification_of_DAC,
      dropdownValue: 'id',
      onChange: this.handleOCHAOrDAC,
    },
    {
      controlName: 'subDACCategory',
      type: 'dropdown',
      load$: this.dacOchaService.loadByParentId(-1),
      label: this.lang.map.DAC_subclassification,
      dropdownValue: 'id',
    },
  ];
  humanitirianControls: ControlWrapper[] = [
    {
      controlName: 'mainUNOCHACategory',
      type: 'dropdown',
      load$: this.dacOchaService.loadByType(AdminLookupTypeEnum.OCHA),
      label: this.lang.map.OCHA_main_classification,
      dropdownValue: 'id',
      onChange: this.handleOCHAOrDAC,
    },
    {
      controlName: 'subUNOCHACategory',
      type: 'dropdown',
      load$: this.dacOchaService.loadByParentId(-1),
      label: this.lang.map.OCHA_subclassification,
      dropdownValue: 'id',
    },
  ];
  columns = ['aidClassification', 'domain', 'mainUNOCHACategory', 'subUNOCHACategory', 'mainDACCategory', 'subDACCategory', 'actions'];

  protected _initComponent(): void {
    this.controls = [...this.baseControls];
    let fg: any = {
      domain: [
        this.model.domain,
        [CustomValidators.required],
      ],
    };
    if (this.charityWorkArea === CharityWorkArea.OUTSIDE) {
      fg = {
        aidClassification: [
          this.model.aidClassification,
          [CustomValidators.required],
        ],
      };
      this.controls = [
        {
          controlName: 'aidClassification',
          type: 'dropdown',
          label: this.lang.map.menu_aid_class,
          load$: this.aidService.loadAsLookups(),
          dropdownValue: 'id',
        },
      ];
    }
    if (this.charityWorkArea === CharityWorkArea.BOTH) {
      fg = {
        ...fg,
        aidClassification: [
          this.model.aidClassification,
          [CustomValidators.required],
        ],
      };
      this.controls.push({
        controlName: 'aidClassification',
        type: 'dropdown',
        label: this.lang.map.menu_aid_class,
        load$: this.aidService.loadAsLookups(),
      });
    }
    this.form = this.fb.group(fg);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.charityWorkArea?.firstChange) return;
    this._initComponent();
  }
  _beforeAdd(model: ForeignAidClassification): ForeignAidClassification | null {
    /* model.aidClassificationInfo = AdminResult.createInstance({
      ...this.
      }) */
    return model;
  }
}
