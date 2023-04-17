import { InterventionField } from '@app/models/intervention-field';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { AdminResult } from '@app/models/admin-result';
import { AdminLookup } from '@app/models/admin-lookup';
import { map, takeUntil } from 'rxjs/operators';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { DacOchaService } from '@app/services/dac-ocha.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-intervention-field-list-popup',
  templateUrl: './intervention-field-list-popup.component.html',
  styleUrls: ['./intervention-field-list-popup.component.scss']
})
export class InterventionFieldListPopupComponent implements OnInit, OnDestroy {
  form: UntypedFormGroup;
  readonly: boolean;
  editItem: number;
  model: InterventionField;
  viewOnly: boolean;

  mainOchaCategories: AdminLookup[] = [];
  subOchaCategories: AdminLookup[] = [];
  private destroy$: Subject<any> = new Subject<any>();

  constructor(@Inject(DIALOG_DATA_TOKEN)
  public data: {
    form: UntypedFormGroup,
    readonly: boolean,
    editItem: number,
    model: InterventionField,
    viewOnly: boolean,
  },
    private dacOchaService: DacOchaService,
    public lang: LangService,
    private dialogRef: DialogRef) {
    this.form = data.form;
    this.readonly = data.readonly;
    this.editItem = data.editItem;
    this.model = data.model;
    this.viewOnly = data.viewOnly;
  }
  ngOnInit() {
    this.form.patchValue(this.model);
    this.loadSubOchaList(this.form.value.mainUNOCHACategory);
    this.loadMainOchaList();
  }
  private loadMainOchaList(): void {
    this.dacOchaService.loadByType(AdminLookupTypeEnum.OCHA)
      .pipe(
        takeUntil(this.destroy$),
        map((result: AdminLookup[]) => {
          return result.filter(x => !x.parentId);
        })
      ).subscribe((list) => {
      this.mainOchaCategories = list
    });
  }
  private loadSubOchaList(mainOchaId: number): void {
    if (!mainOchaId) {
      this.subOchaCategories = [];
      return;
    }
    this.dacOchaService.loadByParentId(mainOchaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => {
        this.subOchaCategories = list;
      });
  }
  handleChangeMainOcha(value: number, userInteraction: boolean = false): void {
    if (userInteraction) {
      this.subUNOCHACategoryField.setValue(null);
      this.loadSubOchaList(value);
    }
  }

  mapFormTo(form: any): InterventionField {
    let mainUNOCHACategoryInfo: AdminResult = (this.mainOchaCategories.find(x => x.id === form.mainUNOCHACategory))?.convertToAdminResult() ?? new AdminResult();
        let subUNOCHACategoryInfo: AdminResult = (this.subOchaCategories.find(x => x.id === form.subUNOCHACategory))?.convertToAdminResult() ?? new AdminResult();

        return (new InterventionField()).clone({
          ...this.model, ...form,
          mainUNOCHACategoryInfo: mainUNOCHACategoryInfo,
          subUNOCHACategoryInfo: subUNOCHACategoryInfo
        });
  }
  get subUNOCHACategoryField(): UntypedFormControl {
    return this.form.get('subUNOCHACategory') as UntypedFormControl;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
