import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { CharityWorkArea } from '@app/enums/charity-work-area.enum';
import { ControlWrapper } from '@app/interfaces/i-control-wrapper';
import { AdminLookup } from '@app/models/admin-lookup';
import { AidLookup } from '@app/models/aid-lookup';
import { LangService } from '@app/services/lang.service';
import { Observable, of } from 'rxjs';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { ForeignAidClassification } from '@app/models/foreign-aid-classification';
import { shareReplay, tap, map } from 'rxjs/operators';
import { Lookup } from '@app/models/lookup';
import { DomainTypes } from '@app/enums/domain-types';
import { CustomValidators } from '@app/validators/custom-validators';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { AidLookupService } from '@app/services/aid-lookup.service';
import { DacOchaService } from '@app/services/dac-ocha.service';
import { AidLookupStatusEnum } from '@app/enums/status.enum';
import { AdminResult } from '@app/models/admin-result';
import { LookupService } from '@app/services/lookup.service';
import {CommonUtils} from "@helpers/common-utils";

@Component({
  selector: 'app-foreign-aid-classifications-popup',
  templateUrl: './foreign-aid-classifications-popup.component.html',
  styleUrls: ['./foreign-aid-classifications-popup.component.scss']
})
export class ForeignAidClassificationsPopupComponent implements OnInit {
  model!: ForeignAidClassification;
  form: UntypedFormGroup;
  readonly: boolean;
  hideSave: boolean;
  editRecordIndex: number;
  charityWorkArea: number;
  latestWorkingSubForParent$!: Observable<never[] | AdminLookup[]>;
  byParent: AdminLookup[] = [];
  domains = this.lookupService.listByCategory.Domain;
  mainDacCategories?: AdminLookup[] = [];
  hideFullScreen = false;

  handleGovernanceDomainChange = (id: number | string) => {
    let fg: any = {};
    let controls: ControlWrapper[] = [];
    if (this.charityWorkArea === CharityWorkArea.BOTH) {
      fg = {
        aidClassification: [this.form.value.aidClassification, [CustomValidators.required]],
      };
      controls = [{
        controlName: 'aidClassification',
        type: 'dropdown',
        langKey: 'menu_aid_class',
        load$: this.aidClassifications$,
        dropdownValue: 'id',
        dropdownOptionDisabled: (optionItem: AidLookup) => {
          return !optionItem.isActive();
        }
      }]
    }
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
  mainDacCategories$ = this.dacOchaService.loadByType(AdminLookupTypeEnum.DAC).pipe(shareReplay()).pipe(
    map(e=>e.filter(x=>x.isActive() || x.id === this.model.mainDACCategory)),
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
    map(e=>e.filter(x=>x.isActive() || x.id === this.model.mainUNOCHACategory)),
    tap(e => {
      this.mainOchaCategories = e;
    })
  );
  baseControls: ControlWrapper[] = [
    {
      controlName: 'domain',
      type: 'dropdown',
      load: this.domains,
      langKey: 'domain',
      dropdownValue: 'lookupKey',
      onChange: this.handleGovernanceDomainChange,
      dropdownOptionDisabled: (optionItem: Lookup) => {
        return !optionItem.isActive();
      }
    },
  ];
  controls = this.baseControls;
  private handleOCHAOrDAC = (id: string | number) => {
    this.form.patchValue({
      subDACCategory: null,
      subUNOCHACategory: null
    })
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
      langKey: 'classification_of_DAC',
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
      langKey: 'DAC_subclassification',
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
      langKey: 'OCHA_main_classification',
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
      langKey: 'OCHA_subclassification',
      dropdownValue: 'id',
      dropdownOptionDisabled: (optionItem: AdminLookup) => {
        return !optionItem.isActive();
      }
    },
  ];
  constructor(
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      form: UntypedFormGroup,
      readonly: boolean,
      hideSave: boolean,
      editRecordIndex: number,
      customData: any,
      model: ForeignAidClassification
    },
    public lang: LangService,
    private lookupService: LookupService,
    private dialogRef: DialogRef,
    private fb: UntypedFormBuilder,
    private aidService: AidLookupService,
    private dacOchaService: DacOchaService,
  ) {
    this.form = data.form;
    this.hideSave = data.hideSave;
    this.readonly = data.readonly;
    this.editRecordIndex = data.editRecordIndex;
    this.model = data.model;
    this.charityWorkArea = data.customData.charityWorkArea;
  }

  ngOnInit() {
    this.controls = [
      {
        controlName: 'aidClassification',
        type: 'dropdown',
        langKey: 'menu_aid_class',
        load$: this.aidClassifications$,
        dropdownValue: 'id',
        dropdownOptionDisabled: (optionItem: AidLookup) => {
          return !optionItem.isActive();
        }
      },
    ];
    if (this.charityWorkArea === CharityWorkArea.OUTSIDE) {
      this.controls = [...this.baseControls];
    }
    if (this.charityWorkArea === CharityWorkArea.BOTH) {
      this.controls = [...this.baseControls];
      this.controls.push({
        controlName: 'aidClassification',
        type: 'dropdown',
        langKey: 'menu_aid_class',
        load$: this.aidClassifications$,
        dropdownValue: 'id',
        dropdownOptionDisabled: (optionItem: AidLookup) => {
          return !optionItem.isActive();
        }
      });
    }

    if (this.model.domain ) {
      this.handleGovernanceDomainChange(this.model.domain);
    }
    this.form.patchValue(this.model);
  }

  mapFormTo(form: any): ForeignAidClassification {
    const model: ForeignAidClassification = new ForeignAidClassification().clone({
      itemId: this.model.itemId,
      objectDBId: this.model.objectDBId,
      ...form
    });
    (model.aidClassification && (model.aidClassificationInfo = AdminResult.createInstance({ ...this.aidClassifications!.find(e => e.id === form.aidClassification) })));
    (model.domain && (model.domainInfo = AdminResult.createInstance({ ...this.domains.find(e => e.lookupKey === form.domain) })));
    (model.mainDACCategory && (model.mainDACCategoryInfo = AdminResult.createInstance({
      ...this.mainDacCategories!.find(e => e.id === form.mainDACCategory)
    })));
    (model.mainUNOCHACategory && (model.mainUNOCHACategoryInfo = AdminResult.createInstance({
      ...this.mainOchaCategories!.find(e => e.id === form.mainUNOCHACategory)
    })));
    if (form.domain) {
      if (form.domain === DomainTypes.DEVELOPMENT) {
        model.subDACCategoryInfo = AdminResult.createInstance({ ...this.byParent!.find(e => e.id === form.subDACCategory) });
      } else {
        model.subUNOCHACategoryInfo = AdminResult.createInstance({ ...this.byParent!.find(e => e.id === form.subUNOCHACategory) });
      }
    }
    model.charityWorkArea = this.charityWorkArea;
    return model;
  }

  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }

  displayFormValidity(form?: UntypedFormGroup | null, element?: HTMLElement | string): void {
    CommonUtils.displayFormValidity((form || this.form), element);
  }
}
