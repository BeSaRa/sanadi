import {Component, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {CustomRoleService} from '../../../services/custom-role.service';
import {CustomRole} from '../../../models/custom-role';
import {PageComponentInterface} from '../../../interfaces/page-component-interface';
import {switchMap, tap} from 'rxjs/operators';
import {ToastService} from '../../../services/toast.service';
import {DialogService} from '../../../services/dialog.service';
import {DialogRef} from '../../../shared/models/dialog-ref';


@Component({
  selector: 'app-custom-role',
  templateUrl: './custom-role.component.html',
  styleUrls: ['./custom-role.component.scss']
})
export class CustomRoleComponent implements OnInit, OnDestroy, PageComponentInterface<CustomRole> {
  add$: Subject<any> = new Subject<any>();
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  customRoles: CustomRole[] = [];
  displayedColumns: string[] = ['id', 'arName', 'enName', 'status', 'actions'];
  reloadSubscription!: Subscription;
  addSubscription!: Subscription;

  constructor(public langService: LangService,
              private dialogService: DialogService,
              private customRoleService: CustomRoleService,
              private toast: ToastService) {
  }


  ngOnDestroy(): void {
    this.reloadSubscription.unsubscribe();
    this.addSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.listenToAdd();
    this.listenToReload();
  }

  add(): void {

  }

  delete(model: CustomRole, event: MouseEvent): void {
    event.preventDefault();
  }

  edit(model: CustomRole, event: MouseEvent): void {
    event.preventDefault();
    const sub = this.customRoleService.openUpdateDialog(model.id).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        this.reload$.next(null);
        sub.unsubscribe();
      });
    });
  }

  listenToAdd(): void {
    this.addSubscription = this.add$.pipe(
      tap(() => {
        this.add();
      })
    ).subscribe();
  }

  listenToReload(): void {
    this.reloadSubscription = this.reload$.pipe(
      switchMap(() => {
        return this.customRoleService.load();
      })
    ).subscribe((roles) => {
      this.customRoles = roles;
    });
  }

  updateStatus(model: CustomRole) {
    const sub = model.toggleStatus().update().subscribe(() => {
      // @ts-ignore
      this.toast.success(this.langService.map.status_x_updated_success.change({x: model.getName()}));
      sub.unsubscribe();
    }, () => {
      // @ts-ignore
      this.toast.error(this.langService.map.status_x_updated_fail.change({x: model.getName()}));
      model.toggleStatus();
      sub.unsubscribe();
    });
  }
}
