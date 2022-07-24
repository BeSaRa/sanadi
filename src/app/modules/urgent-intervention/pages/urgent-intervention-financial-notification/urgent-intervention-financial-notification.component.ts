import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { LangService } from '@app/services/lang.service';
import { Observable } from 'rxjs';
import { UrgentInterventionFinancialNotification } from '@app/models/urgent-intervention-financial-notification';
import { UrgentInterventionFinancialNotificationService } from './../../../../services/urgent-intervention-financial-notification.service';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';

@Component({
  selector: 'app-urgent-intervention-financial-notification',
  templateUrl: './urgent-intervention-financial-notification.component.html',
  styleUrls: ['./urgent-intervention-financial-notification.component.scss']
})
export class UrgentInterventionFinancialNotificationComponent extends EServicesGenericComponent<UrgentInterventionFinancialNotification, UrgentInterventionFinancialNotificationService> {
  public form!: FormGroup;
  constructor(
    public service: UrgentInterventionFinancialNotificationService,
    public lang: LangService,
    public fb: FormBuilder
  ) {
    super();
  }
  _getNewInstance(): UrgentInterventionFinancialNotification {
    return new UrgentInterventionFinancialNotification().clone();
  }
  _initComponent(): void {
  }
  _buildForm(): void {
    this.form = this.fb.group({})
  }
  _afterBuildForm(): void {

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
  _prepareModel(): UrgentInterventionFinancialNotification | Observable<UrgentInterventionFinancialNotification> {
    throw new Error('Method not implemented.');
  }
  _afterSave(model: UrgentInterventionFinancialNotification, saveType: SaveTypes, operation: OperationTypes): void {
    throw new Error('Method not implemented.');
  }
  _saveFail(error: any): void {
    throw new Error('Method not implemented.');
  }
  _launchFail(error: any): void {
    throw new Error('Method not implemented.');
  }
  _destroyComponent(): void {

  }
  _updateForm(model: UrgentInterventionFinancialNotification | undefined): void {
    throw new Error('Method not implemented.');
  }
  _resetForm(): void {
  }
}
