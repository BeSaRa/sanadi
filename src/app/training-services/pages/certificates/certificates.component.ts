import {Component, ViewChild} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {Certificate} from '@app/models/certificate';
import {CertificateService} from '@app/services/certificate.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {SharedService} from '@app/services/shared.service';
import {ToastService} from '@app/services/toast.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {catchError, exhaustMap, filter, switchMap, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {TableComponent} from '@app/shared/components/table/table.component';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {SortEvent} from '@contracts/sort-event';
import {CommonUtils} from '@helpers/common-utils';
import {JobTitle} from '@models/job-title';

@Component({
  selector: 'certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.scss']
})
export class CertificatesComponent extends AdminGenericComponent<Certificate, CertificateService> {

  constructor(public lang: LangService,
              public service: CertificateService,
              private dialogService: DialogService,
              private sharedService: SharedService,
              private toast: ToastService) {
    super();
  }
  actions: IMenuItem<Certificate>[] = [
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item) => this.edit$.next(item)
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item) => this.delete(item)
    },
    // activate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      onClick: (item) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => !item.status
    },
    // deactivate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_deactivate',
      onClick: (item) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => item.status
    }
  ];
  @ViewChild('table') table!: TableComponent;
  displayedColumns: string[] = ['documentTitle', 'status', 'actions'];

  sortingCallbacks = {
    status: (a: Certificate, b: Certificate, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.getStatusText().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.getStatusText().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
  }

  get selectedRecords(): Certificate[] {
    return this.table.selection.selected;
  }

  listenToEdit(): void {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.editTemplateDialog(model).pipe(catchError(_ => of(null)));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  delete(model: Certificate, event?: MouseEvent): void {
    event?.preventDefault();
    // @ts-ignore
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.documentTitle});
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.deleteTemplate().subscribe(() => {
          this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.documentTitle}));
          this.reload$.next(null);
          sub.unsubscribe();
        });
      }
    });
  }

  deleteBulk($event: MouseEvent): void {
    $event.preventDefault();
    if (this.selectedRecords.length > 0) {
      const message = this.lang.map.msg_confirm_delete_selected;
      this.dialogService.confirm(message)
        .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const ids = this.selectedRecords.map((item) => {
            return item.id;
          });
          const sub = this.service.deleteBulk(ids).subscribe((response) => {
            this.sharedService.mapBulkResponseMessages(this.selectedRecords, 'id', response)
              .subscribe(() => {
                this.table && this.table.clearSelection();
                this.reload$.next(null);
                sub.unsubscribe();
              });
          });
        }
      });
    }
  }

  toggleStatus(model: Certificate) {
    model.status ? model.status = false : model.status = true;
    const successMessage = this.lang.map.msg_status_x_updated_success;
    const failMessage = this.lang.map.msg_status_x_updated_fail;
    this.service.updateTemplate(model)
      .subscribe(() => {
        this.toast.success(successMessage.change({x: model.documentTitle}));
        this.reload$.next(null);
      }, () => {
        this.toast.error(failMessage.change({x: model.documentTitle}));
        this.reload$.next(null);
      });
  }
}
