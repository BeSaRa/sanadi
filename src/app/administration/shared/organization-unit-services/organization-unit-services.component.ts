import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {OrgUnit} from '@app/models/org-unit';
import {UntypedFormControl} from '@angular/forms';
import {OrgUnitService} from '@app/models/org-unit-service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {TableComponent} from '@app/shared/components/table/table.component';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {ServiceDataService} from '@app/services/service-data.service';
import {ServiceData} from '@app/models/service-data';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {OrganizationUnitServicesService} from '@app/services/organization-unit-services.service';
import {SharedService} from '@app/services/shared.service';
import {catchError} from 'rxjs/operators';
import {of} from 'rxjs';

@Component({
  selector: 'organization-unit-services',
  templateUrl: './organization-unit-services.component.html',
  styleUrls: ['./organization-unit-services.component.scss']
})
export class OrganizationUnitServicesComponent implements OnInit {
  @Input() orgUnit!: OrgUnit;

  constructor(public langService: LangService,
              private dialogService: DialogService,
              private toast: ToastService,
              private sharedService: SharedService,
              private orgUnitLinkedServicesService: OrganizationUnitServicesService,
              private serviceDataService: ServiceDataService) {
  }

  ngOnInit(): void {
    this.loadServicesDataList();
    this.loadOrgUnitLinkedServices();
  }

  @ViewChild('table') table!: TableComponent;
  commonStatusEnum = CommonStatusEnum;
  serviceDataList: ServiceData[] = [];
  selectedOuService: UntypedFormControl = new UntypedFormControl(null);
  orgUnitLinkedServices: OrgUnitService[] = [];
  linkedServicesFilterControl: UntypedFormControl = new UntypedFormControl('');
  linkedServicesDisplayedColumns: string[] = ['rowSelection', 'serviceName', 'actions'];

  linkedServicesActions: IMenuItem<OrgUnitService>[] = [
// delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: 'mdi-close-box',
      onClick: (item: OrgUnitService) => this.deleteLinkedService(item)
    }
  ];

  linkedServicesBulkActions: IGridAction[] = [
    {
      langKey: 'btn_delete',
      callback: _ => {
        this.deleteBulkLinkedServices();
      },
      icon: 'mdi mdi-delete'
    }
  ]

  sortingCallbacks = {
    serviceName: (a: OrgUnitService, b: OrgUnitService, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.serviceDataInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.serviceDataInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  get selectedRecords(): OrgUnitService[] {
    return this.table.selection.selected;
  }

  loadServicesDataList() {
    this.serviceDataService.loadAsLookups().subscribe(list => {
      this.serviceDataList = list;
    });
  }

  loadOrgUnitLinkedServices() {
    this.orgUnit.loadLinkedServices().subscribe(list => {
      this.orgUnitLinkedServices = list;
      this.table && this.table.clearSelection();
    });
  }

  ouServiceExists(service: ServiceData): boolean {
    return (this.orgUnitLinkedServices.map(x => x.serviceId)).includes(service.id);
  }

  addOuLinkedService(): void {
    if (!this.selectedOuService.value) {
      this.toast.info(this.langService.map.msg_please_select_service_to_add);
      return;
    }

    const data = (new OrgUnitService()).clone({
      serviceId: this.selectedOuService.value.id,
      orgUnitId: this.orgUnit.id,
      status: CommonStatusEnum.ACTIVATED
    });

    data.save().pipe(
      catchError(() => {
        return of(null);
      })).subscribe((result: OrgUnitService | null) => {
      if (!result) {
        return;
      }
      this.toast.success(this.langService.map.msg_create_x_success.change({x: this.selectedOuService.value.getName()}));
      this.selectedOuService.reset();
      this.loadOrgUnitLinkedServices();
    });
  }

  deleteLinkedService(model: OrgUnitService, $event?: Event): void {
    $event?.preventDefault();
    const message = this.langService.map.msg_confirm_delete_x.change({x: model.serviceDataInfo.getName()});
    this.dialogService.confirm(message).onAfterClose$
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const sub = model.delete().subscribe(() => {
            this.toast.success(this.langService.map.msg_delete_x_success.change({x: model.serviceDataInfo.getName()}));
            this.loadOrgUnitLinkedServices();
            sub.unsubscribe();
          });
        }
      });
  }

  deleteBulkLinkedServices($event?: Event): void {
    $event?.preventDefault();
    if (this.selectedRecords.length > 0) {
      this.dialogService.confirm(this.langService.map.msg_confirm_delete_selected)
        .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const ids = this.selectedRecords.map((item) => {
            return item.id;
          });

          const sub = this.orgUnitLinkedServicesService.deleteBulk(ids).subscribe((response) => {
            this.sharedService.mapBulkResponseMessages(this.selectedRecords, 'id', response)
              .subscribe(() => {
                this.loadOrgUnitLinkedServices();
                sub.unsubscribe();
              });
          });
        }
      });
    }
  }

  toggleLinkedServiceStatus(_row: Event): void {
    console.log('toggle status');
  }
}
