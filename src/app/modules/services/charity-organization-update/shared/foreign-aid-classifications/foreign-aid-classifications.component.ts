import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { CharityWorkArea } from '@enums/charity-work-area.enum';
import { ListModelComponent } from '@app/generics/ListModel-component';
import { ForeignAidClassification } from '@models/foreign-aid-classification';
import { LangService } from '@services/lang.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { ComponentType } from '@angular/cdk/portal';
import { ForeignAidClassificationsPopupComponent } from '../../popups/foreign-aid-classifications-popup/foreign-aid-classifications-popup.component';

@Component({
  selector: 'foreign-aid-classifications',
  templateUrl: './foreign-aid-classifications.component.html',
  styleUrls: ['./foreign-aid-classifications.component.scss'],
})
export class ForeignAidClassificationsComponent extends ListModelComponent<ForeignAidClassification> implements OnChanges {
  form!: UntypedFormGroup;
  columns = ['aidClassification', 'domain', 'mainUNOCHACategory', 'subUNOCHACategory', 'mainDACCategory', 'subDACCategory', 'actions'];
  filterControl: UntypedFormControl = new UntypedFormControl('');

  get list() {
    return this._list;
  }

  @Input() set list(_list: ForeignAidClassification[]) {
    this._list = _list;
  }

  @Input() readonly!: boolean;
  @Input() charityWorkArea!: number;
  @Input() charityId!: number;

  constructor(
    private fb: UntypedFormBuilder,
    public lang: LangService,
  ) {
    super(ForeignAidClassification);
  }
_getPopupComponent(): ComponentType<any> {
    return ForeignAidClassificationsPopupComponent;
  }
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
    if (this.model.charityWorkArea === CharityWorkArea.OUTSIDE) {
      fg = {
        domain: [
          this.model.domain,
          [CustomValidators.required],
        ],
      };
    }
    if (this.model.charityWorkArea === CharityWorkArea.BOTH) {
      fg = {
        domain: [
          this.model.domain,
          [CustomValidators.required],
        ],
      };
      fg = {
        ...fg,
        aidClassification: [
          this.model.aidClassification,
          [CustomValidators.required],
        ],
      };
    }
    this.form = this.fb.group(fg);
    this.customData = {
      charityWorkArea: this.model.charityWorkArea
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.charityWorkArea || changes.charityWorkArea?.firstChange || changes.charityId) {
      return;
    }
    this.model = new ForeignAidClassification();
    this._list = [];
    this._initComponent();
  }

}
