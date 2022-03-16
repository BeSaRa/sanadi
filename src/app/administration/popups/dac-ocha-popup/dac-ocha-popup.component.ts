import {Component, Inject} from '@angular/core';
import {FormManager} from '@app/models/form-manager';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {LangService} from '@app/services/lang.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ExceptionHandlerService} from '@app/services/exception-handler.service';
import {LookupService} from '@app/services/lookup.service';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DialogService} from '@app/services/dialog.service';
import {Lookup} from '@app/models/lookup';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {DacOcha} from '@app/models/dac-ocha';
import {Observable, Subject} from 'rxjs';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {takeUntil} from 'rxjs/operators';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DacOchaService} from '@app/services/dac-ocha.service';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';

@Component({
  selector: 'dac-ocha-popup',
  templateUrl: './dac-ocha-popup.component.html',
  styleUrls: ['./dac-ocha-popup.component.scss']
})
export class DacOchaPopupComponent extends AdminGenericDialog<DacOcha> {
  dacOchaTypeId!: number;
  classification!: Lookup;
  actionIconsEnum = ActionIconsEnum;
  statuses: Lookup[] = this.lookupService.listByCategory.CommonStatus;
  form!: FormGroup;
  fm!: FormManager;
  operation!: OperationTypes;
  model!: DacOcha;
  validateFieldsVisible = true;
  saveVisible = true;
  tabsData: IKeyValue = {
    basic: {name: 'basic', index: 0},
    subDacOchas: {name: 'subDacOchas', index: 1}
  };
  selectedTabIndex$: Subject<number> = new Subject<number>();
  selectedTab: string = 'basic';
  validToAddSubDacOchas = false;
  columns = ['arName', 'enName', 'status', 'actions'];
  subDacOchas: DacOcha[] = [];
  reloadSubDacOchas$: Subject<void> = new Subject<void>();

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<DacOcha>,
              public lang: LangService,
              public fb: FormBuilder,
              public exceptionHandlerService: ExceptionHandlerService,
              public lookupService: LookupService,
              public toast: ToastService,
              public dialogRef: DialogRef,
              public dialogService: DialogService,
              public dacOchaService: DacOchaService) {
    super();
    this.operation = data.operation;
    this.model = data.model;
    this.dacOchaTypeId = data.dacOchaTypeId;
    this.selectedTab = data.selectedTab;
  }

  initPopup(): void {
    this.validToAddSubDacOchas = this.model.id != null;
    this.listenToReloadSubDacOchas();
    this.reloadSubDacOchas$.next();

    this.classification = this.lookupService.listByCategory.ServiceWorkField
      .find(classification => classification.lookupKey === this.dacOchaTypeId)!;

    this._setSelectedTab();
  }

  private _setSelectedTab(): void {
    setTimeout(() => {
      if (this.tabsData.hasOwnProperty(this.selectedTab) && this.tabsData[this.selectedTab]) {
        this.selectedTabIndex$.next(this.tabsData[this.selectedTab].index);
      }
    })
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    this.fm = new FormManager(this.form, this.lang);
  }

  beforeSave(model: DacOcha, form: FormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: DacOcha, form: FormGroup): Observable<DacOcha> | DacOcha {
    const dacOcha = (new DacOcha()).clone({...model, ...form.value});
    dacOcha.type = this.dacOchaTypeId;
    return dacOcha;
  }

  afterSave(model: DacOcha, dialogRef: DialogRef): void {
    this.validToAddSubDacOchas = true;
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    // @ts-ignore
    this.toast.success(message.change({x: model.getName()}));
    this.model = model;
    const operationBeforeSave = this.operation;
    this.operation = OperationTypes.UPDATE;

    if (operationBeforeSave == OperationTypes.UPDATE) {
      this.dialogRef.close(this.model);
    }
  }

  saveFail(error: Error): void {
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ?
      this.lang.map.add_dac_ocha.change({x: this.classification.getName()}) :
      this.lang.map.edit_dac_ocha.change({x: this.classification.getName()});
  };

  addSubDacOcha(): void {
    const sub = this.dacOchaService.openCreateSubDacOchaDialog(this.model.id, this.dacOchaTypeId).onAfterClose$.subscribe(() => {
      this.reloadSubDacOchas$.next();
      sub.unsubscribe();
    });
  }

  edit(subDacOcha: DacOcha, $event: MouseEvent): void {
    $event.preventDefault();
    const sub = this.dacOchaService.openUpdateSubDacOchaDialog(subDacOcha.id, this.dacOchaTypeId, this.model.id).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        this.reloadSubDacOchas$.next();
        sub.unsubscribe();
      });
    });
  }

  delete(event: MouseEvent, model: DacOcha): void {
    event.preventDefault();
    // @ts-ignore
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete().subscribe(() => {
          // @ts-ignore
          this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.getName()}));
          this.reloadSubDacOchas$.next();
          sub.unsubscribe();
        });
      }
    });
  }

  listenToReloadSubDacOchas() {
    this.reloadSubDacOchas$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
      if (this.model.id) {
        this.model.loadSubDacOchas()
          .pipe(takeUntil(this.destroy$))
          .subscribe(subDacOchas => {
            this.subDacOchas = subDacOchas;
          });
      }
    });
  }

  destroyPopup(): void {
  }
}
