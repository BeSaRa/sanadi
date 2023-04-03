import {Component, Input} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {AdminLookupTypeEnum} from '@enums/admin-lookup-type-enum';
import {ListModelComponent} from '@app/generics/ListModel-component';
import {DateUtils} from '@helpers/date-utils';
import {ControlWrapper} from '@contracts/i-control-wrapper';
import {AdminLookup} from '@models/admin-lookup';
import {AdminResult} from '@models/admin-result';
import {Bylaw} from '@models/bylaw';
import {AdminLookupService} from '@services/admin-lookup.service';
import {LangService} from '@services/lang.service';
import {DatepickerOptionsMap} from '@app/types/types';
import { ComponentType } from '@angular/cdk/portal';
import { BylawsPopupComponent } from './bylaws-popup/bylaws-popup.component';

@Component({

  selector: 'bylaws',
  templateUrl: './bylaws.component.html',
  styleUrls: ['./bylaws.component.scss']
})
export class BylawsComponent extends ListModelComponent<Bylaw> {
  protected _getPopupComponent(): ComponentType<any> {
    return BylawsPopupComponent;
  }
  get list() {
    return this._list;
  }

  @Input() set list(_list: Bylaw[]) {
    this._list = _list;
  }

  @Input() readonly!: boolean;
  form!: UntypedFormGroup;
  columns = ['fullName', 'firstReleaseDate', 'lastUpdateDate', 'category', 'actions'];

  constructor(private fb: UntypedFormBuilder, public lang: LangService) {
    super(Bylaw);
  }

  protected _initComponent(): void {
    this.form = this.fb.group(this.model.buildForm());
  }

}
