import {Component, ViewChild} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {Trainer} from '@app/models/trainer';
import {TrainerService} from '@app/services/trainer.service';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {SharedService} from '@app/services/shared.service';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {TableComponent} from '@app/shared/components/table/table.component';
import {JobTitle} from '@models/job-title';

@Component({
  selector: 'accredited-trainer',
  templateUrl: './accredited-trainer.component.html',
  styleUrls: ['./accredited-trainer.component.scss']
})
export class AccreditedTrainerComponent extends AdminGenericComponent<Trainer, TrainerService> {
  constructor(public lang: LangService,
              public service: TrainerService,
              private dialogService: DialogService,
              private sharedService: SharedService,
              private toast: ToastService) {
    super();
  }

  actions: IMenuItem<Trainer>[] = [
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (trainer) => this.edit$.next(trainer)
    }
  ];
  displayedColumns: string[] = ['arName', 'enName', 'specialization', 'jobTitle', 'actions'];
  @ViewChild('table') table!: TableComponent;

  afterReload(): void {
    this.table && this.table.clearSelection();
  }

  get selectedRecords(): JobTitle[] {
    return this.table.selection.selected;
  }

  delete(event: MouseEvent, model: Trainer): void {
    event.preventDefault();
    // @ts-ignore
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete().subscribe(() => {
          // @ts-ignore
          this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.getName()}));
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
                this.table.clearSelection();
                this.reload$.next(null);
                sub.unsubscribe();
              });
          });
        }
      });
    }
  }
}
