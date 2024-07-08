import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, of, Subject} from "rxjs";
import {LangService} from "@services/lang.service";
import {ToastService} from "@services/toast.service";
import {CustomServiceTemplateService} from "@services/custom-service-template.service";
import {DialogService} from "@services/dialog.service";
import {SharedService} from "@services/shared.service";
import {UntypedFormControl} from "@angular/forms";
import {CustomServiceTemplate} from "@models/custom-service-template";
import {CaseTypes} from "@enums/case-types.enum";
import {IMenuItem} from "@modules/context-menu/interfaces/i-menu-item";
import {ActionIconsEnum} from "@enums/action-icons-enum";
import {catchError, exhaustMap, filter, switchMap, takeUntil} from "rxjs/operators";
import {UserClickOn} from "@enums/user-click-on.enum";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {CommonStatusEnum} from "@enums/common-status.enum";

@Component({
  selector: 'service-data-custom-templates',
  templateUrl: './service-data-custom-templates.component.html',
  styleUrls: ['./service-data-custom-templates.component.scss']
})
export class ServiceDataCustomTemplatesComponent implements OnInit, OnDestroy{
  private destroy$: Subject<void> = new Subject();

  constructor(public lang: LangService,
              private toast: ToastService,
              private customServiceTemplate: CustomServiceTemplateService,
              private dialogService: DialogService,
              private sharedService: SharedService) {
  }

  @Input() list: CustomServiceTemplate[] = [];
  @Input() readonly: boolean = false;
  @Input() caseType!: CaseTypes;

  columns = ['arabicName', 'englishName', 'templateType', 'status', 'actions'];

  filterControl: UntypedFormControl = new UntypedFormControl('');

  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  add$: Subject<CustomServiceTemplate> = new Subject<any>();
  edit$: Subject<CustomServiceTemplate> = new Subject<CustomServiceTemplate>();
  view$: Subject<CustomServiceTemplate> = new Subject<CustomServiceTemplate>();

  actions: IMenuItem<CustomServiceTemplate>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: CustomServiceTemplate) => this.edit$.next(item),
      show: (_item: CustomServiceTemplate) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: CustomServiceTemplate) => this.view$.next(item),
    },
    // download template
    {
      type: 'action',
      icon: ActionIconsEnum.DOWNLOAD,
      label: 'btn_download',
      onClick: (item: CustomServiceTemplate) => this.downloadTemplate(item),
    },
    // activate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS_ACTIVE,
      label: 'btn_activate',
      onClick: (item: CustomServiceTemplate) => this.toggleStatus(item),
      show: (item) => {
        return !this.readonly && !item.isActive;
      },
      displayInGrid: false
    },
    // deactivate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS_INACTIVE,
      label: 'btn_deactivate',
      onClick: (item: CustomServiceTemplate) => this.toggleStatus(item),
      show: (item) => {
        return !this.readonly && item.isActive;
      },
      displayInGrid: false
    }
  ];

  ngOnInit(): void {
    this.listenToReload();
    this.listenToAdd();
    this.listenToEdit();
    this.listenToView();
  }

  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(switchMap(() => {
        return this.customServiceTemplate.loadTemplatesByCaseType(this.caseType)
          .pipe(catchError(_ => of([])))
      }))
      .subscribe((list: CustomServiceTemplate[]) => {
        this.list = list;
      });
  }

  private listenToAdd() {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter(()=> !this.readonly))
      .pipe(switchMap(() => this.customServiceTemplate.openAddDialog(this.caseType, this.list).onAfterClose$))
      .subscribe(() => {
        this.reload$.next(null);
      });
  }

  private listenToEdit() {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter(()=> !this.readonly))
      .pipe(exhaustMap((model) => this.customServiceTemplate.openUpdateDialog(model, this.caseType, this.list)))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  private listenToView() {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.customServiceTemplate.openViewDialog(model, this.caseType, this.list)
          .pipe(catchError(_ => of(null)));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  private downloadTemplate(model: CustomServiceTemplate) {
    this.customServiceTemplate.loadTemplateDocId(this.caseType, model.id)
      .subscribe((result) => {
        if (result.blob.size === 0) {
          return;
        }
        this.sharedService.downloadFileToSystem(result.blob)
      });
  }

  toggleStatus(model: CustomServiceTemplate): void {
    if (this.readonly) {
      return;
    }
    let updateObservable = model.isActive
      ? this.customServiceTemplate.updateStatus(this.caseType, model, CommonStatusEnum.DEACTIVATED)
      : this.customServiceTemplate.updateStatus(this.caseType, model, CommonStatusEnum.ACTIVATED);
    updateObservable.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_status_x_updated_success.change({x: model.getName()}));
        this.reload$.next(null);
      },()=> this.reload$.next(null));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
