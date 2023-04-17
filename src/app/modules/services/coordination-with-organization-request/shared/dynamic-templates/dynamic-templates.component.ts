import { DateUtils } from '@helpers/date-utils';
import { DynamicModel } from '@models/dynamic-model';
import {
  Component, Input,
  OnInit
} from '@angular/core';
import {
  FormBuilder, UntypedFormControl, UntypedFormGroup
} from '@angular/forms';
import { UserClickOn } from '@enums/user-click-on.enum';
import { DialogService } from '@services/dialog.service';
import { LangService } from '@services/lang.service';
import { ToastService } from '@services/toast.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map, take, takeUntil } from 'rxjs/operators';
import { TemplateFieldTypes } from '@enums/template-field-types.enum';
import { CoordinationWithOrganizationTemplate } from '@models/corrdination-with-organization-template';
import { ProcessFieldBuilder } from '@app/administration/popups/general-process-popup/process-formly-components/process-fields-builder';
import { DynamicModelService } from '@services/dynamic-models.service';
import { DynamicTemplatesPopupComponent } from '../../popups/dynamic-templates-popup/dynamic-templates-popup.component';

@Component({
  selector: 'app-dynamic-templates',
  templateUrl: './dynamic-templates.component.html',
  styleUrls: ['./dynamic-templates.component.scss'],
})
export class DynamicTemplatesComponent implements OnInit {

  @Input() profileId!: number | undefined;
  @Input() templateId!: number | undefined;

  allowListUpdate: boolean = true;
  private _list: CoordinationWithOrganizationTemplate[] = [];
  @Input() set list(list: CoordinationWithOrganizationTemplate[]) {
    if (this.allowListUpdate === true) {
      this._list = list;
      this.listDataSource.next(this._list);
    }
  }
  model: CoordinationWithOrganizationTemplate = new CoordinationWithOrganizationTemplate();
  get list(): CoordinationWithOrganizationTemplate[] {
    return this._list;
  }
  @Input() readonly: boolean = false;
  @Input() canUpdate: boolean = true;
  @Input() isClaimed: boolean = false;
  fieldBuilder: ProcessFieldBuilder;

  listDataSource: BehaviorSubject<CoordinationWithOrganizationTemplate[]> = new BehaviorSubject<
    CoordinationWithOrganizationTemplate[]
  >([]);
  columns = ['actions'];

  editIndex: number = -1;
  viewOnly: boolean = false;
  private save$: Subject<any> = new Subject<any>();

  add$: Subject<any> = new Subject<any>();
  private recordChanged$: Subject<CoordinationWithOrganizationTemplate | null> =
    new Subject<CoordinationWithOrganizationTemplate | null>();
  private currentRecord?: CoordinationWithOrganizationTemplate;

  private destroy$: Subject<any> = new Subject<any>();
  formOpend = false;
  form!: UntypedFormGroup;

  filterControl: UntypedFormControl = new UntypedFormControl('');
  usedModel!: DynamicModel;
  constructor(
    public lang: LangService,
    private toastService: ToastService,
    private dialogService: DialogService,
    private dynamicModelService: DynamicModelService,
    private fb: FormBuilder
  ) {

    this.fieldBuilder = new ProcessFieldBuilder();
  }
  ngOnInit(): void {
    this.buildForm();
    this.listenToAdd();
    this.listenToRecordChange();
    this.listenToSave();
    if (this.templateId)
      this.dynamicModelService.getById(this.templateId).subscribe((model: DynamicModel) => {
        this.usedModel = model;
        this.fieldBuilder.generateFromString(model.template);
        this.columns = this.fieldBuilder.fields.reduce((p, c) => {
          if (c.showOnTable)
            return [c.identifyingName, ...p];
          else return p;
        }, this.columns)
      })
  }
  getCellValue(row: CoordinationWithOrganizationTemplate, col: string) {
    if (!row.generatedTemplate)
      return '---';
    const field = row.generatedTemplate.find(f => f.identifyingName == col);
    if (field?.value) {
      if (field?.type == TemplateFieldTypes.dateField) {
        return DateUtils.getDateStringFromDate(field?.value);
      } else if (field?.type == TemplateFieldTypes.selectField || field?.type == TemplateFieldTypes.yesOrNo) {
        return field.options.find(o => o.id == field.value)?.name;
      }
      return field?.value;
    } else {
      return '---';
    }
  }
  getHeaderName(col: string) {
    return this.fieldBuilder.fields.find(f => f.identifyingName == col)?.getName() || col
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
  buildForm(): void {
    this.form = this.fb.group({});
  }
  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.viewOnly = false;
      this.formOpend = true;
      this.recordChanged$.next(new CoordinationWithOrganizationTemplate());
    });
  }
  private listenToRecordChange() {
    this.recordChanged$.pipe(takeUntil(this.destroy$)).subscribe((record) => {
      if (record && this.profileId) record.profileId = this.profileId;
      this.currentRecord = record || undefined;
      if(this.currentRecord) {
        this.openFormDialog();
      }
    });
  }
  _getFormPopup() {
    return DynamicTemplatesPopupComponent;
  }
  openFormDialog() {
    this.dialogService.show(this._getFormPopup(), {
      form: this.form,
      editIndex: this.editIndex,
      model: this.currentRecord,
      readonly: this.readonly,
      viewOnly: this.viewOnly,
      usedModel: this.usedModel,
      fieldBuilder: this.fieldBuilder,
    }).onAfterClose$.subscribe((data) => {
      if (data) {
        this.onSave();
      } else {
        this.onCancel();
      }
    })
  }


  private listenToSave() {
    const form$ = this.save$.pipe(
      map(() => {
        return this.form as UntypedFormGroup;
      })
    );

    const validForm$ = form$.pipe(filter((form) => form.valid));
    const invalidForm$ = form$.pipe(filter((form) => form.invalid));
    invalidForm$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.dialogService
        .error(this.lang.map.msg_all_required_fields_are_filled)
        .onAfterClose$.pipe(take(1))
        .subscribe(() => {
          this.form?.markAllAsTouched();
          this.openFormDialog();
        });
    });

    validForm$
      .pipe(
        takeUntil(this.destroy$),
        map(() => {
          return this.form as UntypedFormGroup;
        }),
        map((form) => {
          this.fieldBuilder.fields.map(f => {
            f.value = form.value[f.id];
          })
          const model = new CoordinationWithOrganizationTemplate().clone({
            ...this.currentRecord,
            templateId: this.templateId,
            template: this.fieldBuilder.generateAsString()
          });
          this.formOpend = false;
          return model;
        })
      )
      .subscribe((model: CoordinationWithOrganizationTemplate) => {
        if (!model) {
          return;
        }
        this._updateList(
          model,
          this.editIndex > -1 ? 'UPDATE' : 'ADD',
          this.editIndex
        );
        this.toastService.success(this.lang.map.msg_save_success);
        this.editIndex = -1;
        this.viewOnly = false;
        this.recordChanged$.next(null);
      });
  }
  private _updateList(
    record: CoordinationWithOrganizationTemplate | null,
    operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE',
    gridIndex: number = -1
  ) {
    if (record) {
      record.generatedTemplate = this.fieldBuilder.fields;
      if (operation === 'ADD') {
        this.list.push(record);
      } else if (operation === 'UPDATE') {
        this.list.splice(gridIndex, 1, record);
      } else if (operation === 'DELETE') {
        this.list.splice(gridIndex, 1);
      }
    }
    this.listDataSource.next(this.list);
  }
  addAllowed(): boolean {
    return !this.readonly;
  }
  onSave() {
    if (this.readonly || this.viewOnly) {
      return;
    }
    this.save$.next();
  }
  onCancel() {
    this.resetForm();
    this.editIndex = -1;
  }
  private resetForm() {
    this.formOpend = false;
    this.form.reset();
    this.form.markAsUntouched();
    this.form.markAsPristine();
  }
  view($event: MouseEvent, record: CoordinationWithOrganizationTemplate, index: number) {
    $event.preventDefault();
    this.formOpend = true;
    this.editIndex = index;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }
  delete($event: MouseEvent, record: CoordinationWithOrganizationTemplate, index: number): any {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.dialogService
      .confirm(this.lang.map.msg_confirm_delete_selected)
      .onAfterClose$.pipe(take(1))
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          this._updateList(record, 'DELETE', index);
          this.toastService.success(this.lang.map.msg_delete_success);
        }
      });
  }
  edit($event: MouseEvent, record: CoordinationWithOrganizationTemplate, index: number) {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.formOpend = true;
    this.editIndex = index;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }
}
