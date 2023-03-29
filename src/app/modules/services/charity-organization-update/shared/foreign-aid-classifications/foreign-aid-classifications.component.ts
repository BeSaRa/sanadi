import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {AdminLookupTypeEnum} from '@enums/admin-lookup-type-enum';
import {CharityWorkArea} from '@enums/charity-work-area.enum';
import {DomainTypes} from '@enums/domain-types';
import {ListModelComponent} from '@app/generics/ListModel-component';
import {ControlWrapper} from '@contracts/i-control-wrapper';
import {ForeignAidClassification} from '@models/foreign-aid-classification';
import {AidLookupService} from '@services/aid-lookup.service';
import {DacOchaService} from '@services/dac-ocha.service';
import {LangService} from '@services/lang.service';
import {LookupService} from '@services/lookup.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {shareReplay, tap} from 'rxjs/operators';
import {AdminResult} from '@models/admin-result';
import {Observable, of} from 'rxjs';
import {AdminLookup} from '@models/admin-lookup';
import {AidLookup} from '@models/aid-lookup';
import {AidLookupStatusEnum} from '@enums/status.enum';
import {Lookup} from '@models/lookup';
import { ComponentType } from '@angular/cdk/portal';

@Component({
  selector: 'foreign-aid-classifications',
  templateUrl: './foreign-aid-classifications.component.html',
  styleUrls: ['./foreign-aid-classifications.component.scss'],
})
export class ForeignAidClassificationsComponent extends ListModelComponent<ForeignAidClassification> implements OnChanges {
  protected _getPopupComponent(): ComponentType<any> {
    throw new Error('Method not implemented.');
  }
  get list() {
    return this._list;
  }

  domains = this.lookupService.listByCategory.Domain;
  mainDacCategories?: AdminLookup[] = [];
  mainDacCategories$ = this.dacOchaService.loadByType(AdminLookupTypeEnum.DAC).pipe(shareReplay()).pipe(
    tap(e => {
      this.mainDacCategories = e;
    })
  );
  aidClassifications?: AidLookup[] = [];
  aidClassifications$ = this.aidService.loadAsLookups().pipe(shareReplay()).pipe(
    tap(e => {
      this.aidClassifications = e.filter(x => x.status !== AidLookupStatusEnum.RETIRED);
    })
  );
  mainOchaCategories: AdminLookup[] = [];
  mainOchaCategories$ = this.dacOchaService.loadByType(AdminLookupTypeEnum.OCHA).pipe(shareReplay()).pipe(
    tap(e => {
      this.mainOchaCategories = e;
    })
  );
  byParent: AdminLookup[] = [];
  latestWorkingSubForParent$!: Observable<never[] | AdminLookup[]>;
  handleGovernanceDomainChange = (id: number | string) => {
    let fg: any = {};
    if (this.model.charityWorkArea === CharityWorkArea.BOTH) {
      fg = {
        aidClassification: [this.model.aidClassification, [CustomValidators.required]],
      };
    }
    const controls: ControlWrapper[] = this.model.charityWorkArea === CharityWorkArea.BOTH ? [{
      controlName: 'aidClassification',
      type: 'dropdown',
      label: this.lang.map.menu_aid_class,
      load$: this.aidClassifications$,
      dropdownValue: 'id',
      dropdownOptionDisabled: (optionItem: AidLookup) => {
        return !optionItem.isActive();
      }
    }] : [];
    if (id === DomainTypes.DEVELOPMENT) {
      this.controls = [...this.baseControls, ...this.developmentControls, ...controls,];
      this.form = this.fb.group({
        domain: [id, [CustomValidators.required]],
        mainDACCategory: [this.model.mainDACCategory, [CustomValidators.required]],
        subDACCategory: [this.model.subDACCategory, [CustomValidators.required]],
        ...fg
      });
      if (this.model.mainDACCategory) {
        this.handleOCHAOrDAC(this.model.mainDACCategory);
      }
    } else {
      this.controls = [...this.baseControls, ...this.humanitarianControls, ...controls];
      this.form = this.fb.group({
        domain: [id, [CustomValidators.required]],
        mainUNOCHACategory: [this.model.mainUNOCHACategory, [CustomValidators.required]],
        subUNOCHACategory: [this.model.subUNOCHACategory, [CustomValidators.required]], ...fg
      });

      if (this.model.mainUNOCHACategory) {
        this.handleOCHAOrDAC(this.model.mainUNOCHACategory);
      }
    }
  };

  constructor(
    private fb: UntypedFormBuilder,
    private lookupService: LookupService,
    public lang: LangService,
    private aidService: AidLookupService,
    private dacOchaService: DacOchaService,
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
      load: this.domains,
      label: this.lang.map.domain,
      dropdownValue: 'lookupKey',
      onChange: this.handleGovernanceDomainChange,
      dropdownOptionDisabled: (optionItem: Lookup) => {
        return !optionItem.isActive();
      }
    },
  ];
  controls = this.baseControls;
  private handleOCHAOrDAC = (id: string | number) => {
    this.latestWorkingSubForParent$ = this.dacOchaService.loadByParentId(
      id as number
    ).pipe(shareReplay()).pipe(
      tap(e => {
        this.byParent = e;
      })
    );
    this.controls[2].load$ = this.latestWorkingSubForParent$;
  };
  developmentControls: ControlWrapper[] = [
    {
      controlName: 'mainDACCategory',
      type: 'dropdown',
      load$: this.mainDacCategories$,
      label: this.lang.map.classification_of_DAC,
      dropdownValue: 'id',
      onChange: this.handleOCHAOrDAC,
      dropdownOptionDisabled: (optionItem: AdminLookup) => {
        return !optionItem.isActive();
      }
    },
    {
      controlName: 'subDACCategory',
      type: 'dropdown',
      load$: of([]),
      label: this.lang.map.DAC_subclassification,
      dropdownValue: 'id',
      dropdownOptionDisabled: (optionItem: AdminLookup) => {
        return !optionItem.isActive();
      }
    },
  ];
  humanitarianControls: ControlWrapper[] = [
    {
      controlName: 'mainUNOCHACategory',
      type: 'dropdown',
      load$: this.mainOchaCategories$,
      label: this.lang.map.OCHA_main_classification,
      dropdownValue: 'id',
      onChange: this.handleOCHAOrDAC,
      dropdownOptionDisabled: (optionItem: AdminLookup) => {
        return !optionItem.isActive();
      }
    },
    {
      controlName: 'subUNOCHACategory',
      type: 'dropdown',
      load$: of([]),
      label: this.lang.map.OCHA_subclassification,
      dropdownValue: 'id',
      dropdownOptionDisabled: (optionItem: AdminLookup) => {
        return !optionItem.isActive();
      }
    },
  ];
  columns = ['aidClassification', 'domain', 'mainUNOCHACategory', 'subUNOCHACategory', 'mainDACCategory', 'subDACCategory', 'actions'];

  protected _initComponent(): void {
    this.model = new ForeignAidClassification().clone({
      ...this.model,
      charityWorkArea: this.charityWorkArea,
    });
    let fg: any = {
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
        load$: this.aidClassifications$,
        dropdownValue: 'id',
        dropdownOptionDisabled: (optionItem: AidLookup) => {
          return !optionItem.isActive();
        }
      },
    ];
    if (this.model.charityWorkArea === CharityWorkArea.OUTSIDE) {
      fg = {
        domain: [
          this.model.domain,
          [CustomValidators.required],
        ],
      };
      this.controls = [...this.baseControls];

    }
    if (this.model.charityWorkArea === CharityWorkArea.BOTH) {
      fg = {
        domain: [
          this.model.domain,
          [CustomValidators.required],
        ],
      };
      this.controls = [...this.baseControls];
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
        load$: this.aidClassifications$,
        dropdownValue: 'id',
        dropdownOptionDisabled: (optionItem: AidLookup) => {
          return !optionItem.isActive();
        }
      });
    }
    this.form = this.fb.group(fg);
    if (this.model.domain) {
      this.handleGovernanceDomainChange(this.model.domain);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.charityWorkArea?.firstChange) {
      return;
    }
    this.model = new ForeignAidClassification();
    this._initComponent();
  }

  _beforeAdd(model: ForeignAidClassification): ForeignAidClassification | null {
    (model.aidClassification && (model.aidClassificationInfo = AdminResult.createInstance({...this.aidClassifications!.find(e => e.id === model.aidClassification)})));
    (model.domain && (model.domainInfo = AdminResult.createInstance({...this.domains.find(e => e.lookupKey === model.domain)})));
    (model.mainDACCategory && (model.mainDACCategoryInfo = AdminResult.createInstance({
      ...this.mainDacCategories!.find(e => e.id === model.mainDACCategory)
    })));

    (model.mainUNOCHACategory && (model.mainUNOCHACategoryInfo = AdminResult.createInstance({
      ...this.mainOchaCategories!.find(e => e.id === model.mainUNOCHACategory)
    })));
    if (model.domain) {
      if (model.domain === DomainTypes.DEVELOPMENT) {
        model.subDACCategoryInfo = AdminResult.createInstance({...this.byParent!.find(e => e.id === model.subDACCategory)});
      } else {
        model.subUNOCHACategoryInfo = AdminResult.createInstance({...this.byParent!.find(e => e.id === model.subUNOCHACategory)});
      }
    }
    model.charityWorkArea = this.charityWorkArea;
    return model;
  }

  _selectOne(row: ForeignAidClassification): void {
    const tempModel = this.model;
    this.charityWorkArea = row.charityWorkArea;
    this.model.domain = row.domain;
    this.model.aidClassification = row.aidClassification;
    this.model.mainDACCategory = row.mainDACCategory;
    this.model.subDACCategory = row.subDACCategory;
    this.model.mainUNOCHACategory = row.mainUNOCHACategory;
    this.model.subUNOCHACategory = row.subUNOCHACategory;
    this._initComponent();
    this.form.patchValue(row);
    this.model = tempModel;
  }
}
