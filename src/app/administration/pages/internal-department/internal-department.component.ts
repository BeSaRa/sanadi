import { Component } from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {InternalDepartment} from '@app/models/internal-department';
import {InternalDepartmentService} from '@app/services/internal-department.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {LangService} from '@app/services/lang.service';
import {catchError, exhaustMap, filter, switchMap, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {DialogRef} from '@app/shared/models/dialog-ref';

@Component({
  selector: 'internal-department',
  templateUrl: './internal-department.component.html',
  styleUrls: ['./internal-department.component.scss']
})
export class InternalDepartmentComponent extends AdminGenericComponent<InternalDepartment, InternalDepartmentService>{
  searchText = '';
  view$: Subject<InternalDepartment> = new Subject<InternalDepartment>();
  actions: IMenuItem<InternalDepartment>[] = [
    {
      type: 'action',
      label: 'btn_reload',
      icon: 'mdi-reload',
      onClick: _ => this.reload$.next(null),
    },
    {
      type: 'action',
      label: 'btn_edit',
      icon: 'mdi-pen',
      onClick: (user) => this.edit$.next(user)
    }
  ];
  displayedColumns: string[] = ['arName', 'enName', 'status', 'actions'];

  constructor(public lang: LangService, public service: InternalDepartmentService) {
    super();
  }

  ngOnInit() {
    this.listenToReload();
    this.listenToAdd();
    this.listenToEdit();
    this.listenToView();
  }

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.openViewDialog(model.id).pipe(catchError(_ => of(null)))
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null))
  }

  edit(department: InternalDepartment, event: MouseEvent) {
    event.preventDefault();
    this.edit$.next(department);
  }

  view(department: InternalDepartment, event: MouseEvent) {
    event.preventDefault();
    this.view$.next(department);
  }

  filterCallback = (record: any, searchText: string) => {
    return record.search(searchText);
  }
}
