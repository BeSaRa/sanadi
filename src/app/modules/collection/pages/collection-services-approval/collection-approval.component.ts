import {Component} from '@angular/core';
import {FormGroup, FormBuilder} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {EServicesGenericComponent} from "@app/generics/e-services-generic-component";
import {CollectionApproval} from "@app/models/collection-approval";
import {CollectionApprovalService} from "@app/services/collection-approval.service";
import {LangService} from '@app/services/lang.service';
import {Observable} from 'rxjs';


// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'collection-approval',
  templateUrl: './collection-approval.component.html',
  styleUrls: ['./collection-approval.component.scss']
})
export class CollectionApprovalComponent extends EServicesGenericComponent<CollectionApproval, CollectionApprovalService> {
  constructor(public lang: LangService,
              public service: CollectionApprovalService,
              public fb: FormBuilder) {
    super();
  }

  form!: FormGroup;

  _getNewInstance(): CollectionApproval {
    return new CollectionApproval()
  }

  _initComponent(): void {
    // throw new Error('Method not implemented.');
  }

  _buildForm(): void {
    // 1 - implement all model properties [done]
    const model = new CollectionApproval()
    // 2 - create the form controls for the model
    this.form = this.fb.group(model.buildForm(true))
    // 3 - draw the screen controls
  }

  _afterBuildForm(): void {
    throw new Error('Method not implemented.');
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    throw new Error('Method not implemented.');
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    throw new Error('Method not implemented.');
  }

  _afterLaunch(): void {
    throw new Error('Method not implemented.');
  }

  _prepareModel(): CollectionApproval | Observable<CollectionApproval> {
    throw new Error('Method not implemented.');
  }

  _afterSave(model: CollectionApproval, saveType: SaveTypes, operation: OperationTypes): void {
    throw new Error('Method not implemented.');
  }

  _saveFail(error: any): void {
    throw new Error('Method not implemented.');
  }

  _launchFail(error: any): void {
    throw new Error('Method not implemented.');
  }

  _destroyComponent(): void {
    throw new Error('Method not implemented.');
  }

  _updateForm(model: CollectionApproval | undefined): void {
    throw new Error('Method not implemented.');
  }

  _resetForm(): void {
    throw new Error('Method not implemented.');
  }


}
