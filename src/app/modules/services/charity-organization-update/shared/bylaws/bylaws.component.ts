import { Component, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ListModelComponent } from '@app/generics/ListModel-component';
import { Bylaw } from '@models/bylaw';
import { LangService } from '@services/lang.service';
import { ComponentType } from '@angular/cdk/portal';
import { BylawsPopupComponent } from '../../popups/bylaws-popup/bylaws-popup.component';

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
  filterControl: UntypedFormControl = new UntypedFormControl('');

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
