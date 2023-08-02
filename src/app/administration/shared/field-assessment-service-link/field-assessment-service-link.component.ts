import {FieldAssessmentServiceEnum} from '@enums/field-assessment-service.enum';
import {LookupService} from '@app/services/lookup.service';
import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {UntypedFormControl} from '@angular/forms';
import {ToastService} from '@app/services/toast.service';
import {of, Subject} from 'rxjs';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {filter, map, share, switchMap, takeUntil} from 'rxjs/operators';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {TableComponent} from '@app/shared/components/table/table.component';
import {DialogService} from '@app/services/dialog.service';
import {SharedService} from '@app/services/shared.service';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {FieldAssessmentServiceLink} from '@app/models/field-assessment-service';
import {Lookup} from '@app/models/lookup';
import {FieldAssessmentServiceLinkService} from '@app/services/field-assessment-service-link.service';
import {FieldAssessment} from '@app/models/field-assessment';
import {FieldAssessmentTypesEnum} from '@app/enums/field-assessment-types.enum';

@Component({
  selector: 'field-assessment-service-link',
  templateUrl: './field-assessment-service-link.component.html',
  styleUrls: ['./field-assessment-service-link.component.scss']
})
export class FieldAssessmentServiceLinkComponent implements OnInit, OnDestroy {
  selectedLinksIds: number[] = [];
  get displayedColumns(): string[] {
    return this.readonly ? ['arName', 'enName'] : ['checkbox', 'arName', 'enName', 'actions'];
  }
  filterControl: UntypedFormControl = new UntypedFormControl();
  selectedLinkControl: UntypedFormControl = new UntypedFormControl();
  services: Lookup[] = this.lookupService.listByCategory.FieldAssessmentServices;
  fieldAssessmentServiceLinkList: FieldAssessmentServiceLink[] = [];
  commonStatusEnum = CommonStatusEnum;
  fieldAssessmentServiceLinkChanged$: Subject<FieldAssessmentServiceLink[]> = new Subject<FieldAssessmentServiceLink[]>();
  @Input()
  type: number = 0;
  @Input()
  readonly: boolean = false;
  @Input()
  operation!: OperationTypes;
  @Input()
  model!: FieldAssessment;
  @ViewChild(TableComponent)
  filedTable!: TableComponent;
  destroy$: Subject<any> = new Subject<any>();

  actions: IGridAction[] = [
    {
      langKey: 'btn_delete',
      callback: _ => {
        this.deleteBulkFieldAssessmentServiceLink();
      },
      icon: 'mdi mdi-delete'
    }
  ]

  constructor(public lang: LangService,
    private toast: ToastService,
    private dialog: DialogService,
    private sharedService: SharedService,
    private lookupService: LookupService,
    private fieldAssessmentServiceLinkService: FieldAssessmentServiceLinkService) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.listenToFieldAssessmentServiceLinkChange();
    if (this.operation !== OperationTypes.CREATE) {
      this.loadFieldAssessmentServiceLink();
    }
  }

  private listenToFieldAssessmentServiceLinkChange() {
    this.fieldAssessmentServiceLinkChanged$
      .pipe(map(data => this.fieldAssessmentServiceLinkList = data))
      .subscribe((fieldAssessmentServiceLink) => {
        this.selectedLinksIds = fieldAssessmentServiceLink.map(item => item.serviceId)
      });
  }

  loadFieldAssessmentServiceLink(): void {
    this.fieldAssessmentServiceLinkService
      .loadFieldAssessmentServiceLinkById(this.model.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => this.fieldAssessmentServiceLinkChanged$.next(result))
  }
  disabledService(service: Lookup) {
    return !this.type || (service.lookupKey == FieldAssessmentServiceEnum.FieldAssessmentServices_3 && this.type == FieldAssessmentTypesEnum.EVALUATION_AXIS)
  }
  linkExistsBefore(link: Lookup): boolean {
    return this.selectedLinksIds.includes(link.lookupKey);
  }

  addFieldAssessmentServiceLink(): void {
    if (!this.selectedLinkControl.value) {
      this.toast.error(this.lang.map.please_select_service_to_link);
      return;
    }
    const addLink$ = this.fieldAssessmentServiceLinkService
      .createFieldAssessmentServiceLink({
        serviceId: this.selectedLinkControl.value.lookupKey,
        fieldAssessmentId: this.model.id,
      })
      .pipe(share())

    addLink$
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        result.serviceDataInfo = this.selectedLinkControl.value;
        this.toast.success(this.lang.map.msg_create_x_success.change({ x: result.serviceDataInfo.getName() }));
        this.fieldAssessmentServiceLinkChanged$.next(this.fieldAssessmentServiceLinkList.concat([result]));
        this.selectedLinkControl.setValue(null);
      })
  }

  deleteBulkFieldAssessmentServiceLink(): void {
    if (!this.filedTable.selection.hasValue()) {
      return;
    }
    of(this.dialog.confirm(this.lang.map.msg_confirm_delete_selected))
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(ref => ref.onAfterClose$))
      .pipe(filter((answer: UserClickOn) => answer === UserClickOn.YES))
      .pipe(map((_) => {
        return this.filedTable.selection.selected.map<number>(fieldAssessmentServiceLink => fieldAssessmentServiceLink.id)
      }))
      .pipe(switchMap(ids => this.fieldAssessmentServiceLinkService.deleteBulk(ids)))
      .pipe(map(result => this.sharedService.mapBulkResponseMessages(this.filedTable.selection.selected, 'id', result)))
      .subscribe(() => {
        const ides = this.filedTable.selection.selected.map(i => i.id);
        this.filedTable && this.filedTable.clearSelection();
        this.fieldAssessmentServiceLinkChanged$.next(this.fieldAssessmentServiceLinkList.filter(fa => !ides.includes(fa.id)));
      });
  }

  deleteFieldAssessmentServiceLink(fieldAssessmentServiceLink: FieldAssessmentServiceLink): void {
    of(this.dialog.confirm(this.lang.map.msg_confirm_delete_x.change({ x: fieldAssessmentServiceLink.serviceDataInfo.getName() })))
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(ref => ref.onAfterClose$))
      .pipe(filter((answer: UserClickOn) => answer === UserClickOn.YES))
      .pipe(switchMap(_ => fieldAssessmentServiceLink.delete()))
      .subscribe((result) => {
        if (result) {
          this.toast.success(this.lang.map.msg_delete_x_success.change({ x: fieldAssessmentServiceLink.serviceDataInfo.getName() }))
          this.fieldAssessmentServiceLinkChanged$.next(this.fieldAssessmentServiceLinkList.filter(fa => fa.id !== fieldAssessmentServiceLink.id))
        } else {
          this.toast.error(this.lang.map.msg_delete_fail.change({ x: fieldAssessmentServiceLink.serviceDataInfo.getName() }))
        }
      })
  }

}
