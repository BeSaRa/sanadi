import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { InspectionSpecialist } from '@app/models/inspection-specialist';
import { InternalUser } from '@app/models/internal-user';
import { DialogService } from '@app/services/dialog.service';
import { InternalUserService } from '@app/services/internal-user.service';
import { LangService } from '@app/services/lang.service';
import { Subject, of } from 'rxjs';
import { takeUntil, switchMap, filter, take, map, tap, catchError } from 'rxjs/operators';
import { ExternalSpecialistPopupComponent } from '../../popups/external-specialist-popup/external-specialist-popup.component';
import { InspectionSpecialistsPopupComponent } from '../../popups/inspection-specialists-popup/inspection-specialists-popup.component';
import { ActualInspectionService } from '@app/services/actual-inspection.service';
import { ActualInspection } from '@app/models/actual-inspection';
import { ToastService } from '@app/services/toast.service';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { LicenseActivity } from '@app/models/license-activity';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';

@Component({
    selector: 'manage-inspection-specialists',
    templateUrl: 'manage-inspection-specialists.component.html',
    styleUrls: ['manage-inspection-specialists.component.scss']
})
export class ManageInspectionSpecialistsComponent implements OnInit, OnDestroy {

    @Input()
    disabled: boolean = false;

    @Input() list: InspectionSpecialist[] = [];
    @Input() actualInspection!: ActualInspection;

    internalSpecialists: InspectionSpecialist[] = [];
    externalSpecialists: InspectionSpecialist[] = [];
    destroy$ = new Subject<void>()
    displayedColumns: string[] = ['arName', 'enName', 'actions'];
    externalSpecialistColumns: string[] = ['externalSpecialistName', 'externalSpecialistEntity', 'externalSpecialistAdjective', 'actions'];
    addInternalSpecialistDialog$: Subject<any> = new Subject<any>();
    addExternalSpecialistDialog$: Subject<any> = new Subject<any>();


    constructor(public lang: LangService,
        private dialog: DialogService,
        private internalUserService: InternalUserService,
        private actualInspectionService: ActualInspectionService,
        private toast: ToastService) {


    }

    internalActions: IMenuItem<InspectionSpecialist>[] = [
          
        // delete
        {
          type: 'action',
          label: 'btn_delete',
          icon: ActionIconsEnum.DELETE,
          onClick: (item: InspectionSpecialist,index) => this.deleteInternalSpecialist(item,index),
          show: () => !this.disabled
        },
        
      ];
    externalActions: IMenuItem<InspectionSpecialist>[] = [
        // view
        {
          type: 'action',
          label: 'view',
          icon: ActionIconsEnum.VIEW,
          onClick: (item: InspectionSpecialist,index) => this.viewItem(item,index),
          show: () => this.disabled
        },
        // edit
        {
          type: 'action',
          icon: ActionIconsEnum.EDIT,
          label: 'btn_edit',
          onClick: (item: InspectionSpecialist,index) => this.editItem(item,index),
          show: () => !this.disabled
        },
        // delete
        {
          type: 'action',
          label: 'btn_delete',
          icon: ActionIconsEnum.DELETE,
          onClick: (item: InspectionSpecialist,index) => this.deleteExternalSpecialist(item,index),
          show: () => !this.disabled
        },
        
      ];
    ngOnDestroy(): void {
        this.destroy$.next()
        this.destroy$.complete()
        this.destroy$.subscribe()
    }

    ngOnInit(): void {
        this.list.forEach(item => {
            if (!!item.internalSpecialist) {
                this.internalSpecialists = this.internalSpecialists.concat(item)
            }
            else {
                this.externalSpecialists = this.externalSpecialists.concat(item)
            }
        })
        this.listenToAddInternalSpecialist();
        this.listenToAddExternalSpecialist();
    }
    listenToAddExternalSpecialist() {
        this.addExternalSpecialistDialog$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.openAddExternalSpecialistDialog()
            })
    }
    openAddExternalSpecialistDialog() {
        this.dialog.show<IDialogData<InspectionSpecialist>>(ExternalSpecialistPopupComponent, {
            model: new InspectionSpecialist(),
            readonly: this.disabled,
            operation: OperationTypes.CREATE,
        }).onAfterClose$
            .pipe(takeUntil(this.destroy$))
            .pipe(filter((value: InspectionSpecialist): value is InspectionSpecialist => !!value))
            .pipe(
                switchMap((value: InspectionSpecialist) => {

                    return this.actualInspectionService.AddSpecialist(value, this.actualInspection)
                        .pipe(map(id => {
                            value.id = id;
                            return value
                        }))
                    //   return of(value)
                }),
                tap(() => {
                    this.toast.success(this.lang.map.msg_added_x_success.change({ x: this.lang.map.specialist }));
                })
            )
            .subscribe((item) => {
                if (!!item) {
                    this.list = this.list.concat(item)
                    this.externalSpecialists = this.externalSpecialists.concat(item)
                }
            })
    }

    listenToAddInternalSpecialist() {
        this.addInternalSpecialistDialog$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.openAddInternalSpecialistDialog()
            })
    }

    openAddInternalSpecialistDialog() {
        this.internalUserService.getAllActive().pipe(
            take(1),
            switchMap(users => {
                return this.dialog.show<IDialogData<InspectionSpecialist>>(InspectionSpecialistsPopupComponent, {
                    model: new InspectionSpecialist(),
                    readonly: this.disabled,
                    users: users,
                    operation: OperationTypes.CREATE,
                }).onAfterClose$
                    .pipe(takeUntil(this.destroy$))
                    .pipe(filter((value: InspectionSpecialist) => !!value))
                    .pipe(filter((value: InspectionSpecialist) => {
                        if(this.list.some((item)=> item.internalSpecialist?.id === value.internalSpecialist.id)){
                            this.toast.error(this.lang.map.msg_duplicate_record_in_list)
                            return false
                        }
                        return true
                    }))
                    .pipe(
                        switchMap((value: InspectionSpecialist) => {

                            return this.actualInspectionService.AddSpecialist(value, this.actualInspection)
                            .pipe(map(id => {
                                value.id = id;
                                return value
                            }))
                        }),
                        tap(() => {
                            this.toast.success(this.lang.map.msg_added_x_success.change({ x: this.lang.map.specialist }));
                        }),
                      
                    )
            })
        ).subscribe((item) => {
            if (!!item) {
                this.list = this.list.concat(item)
                this.internalSpecialists = this.internalSpecialists.concat(item)
            }


        })
    }
    deleteInternalSpecialist(item: InspectionSpecialist, index: number) {
        this.dialog
            .confirm(this.lang.map.msg_confirm_delete_selected)
            .onAfterClose$
            .pipe(takeUntil(this.destroy$))
            .pipe(filter((value): value is UserClickOn.YES => value === UserClickOn.YES))
            .pipe(
                switchMap((_) => {

                    return this.actualInspectionService.deleteSpecialist(item.id)
                }),
                map(() => {
                    this.toast.success(this.lang.map.msg_delete_success);
                    return true
                }),
                catchError((_) => {
                    this.toast.error(this.lang.map.msg_delete_fail);
                    return of(false)
                })
            )
            .subscribe((success) => {
                if (success) {
                    this.list = this.list.filter(x => x !== item)
                    this.internalSpecialists = this.internalSpecialists.filter(x => x !== item)

                }


            })
    }
    deleteExternalSpecialist(item: InspectionSpecialist, index: number) {
        this.dialog
            .confirm(this.lang.map.msg_confirm_delete_selected)
            .onAfterClose$
            .pipe(takeUntil(this.destroy$))
            .pipe(filter((value): value is UserClickOn.YES => value === UserClickOn.YES))
            .pipe(
                switchMap((_) => {

                    return this.actualInspectionService.deleteSpecialist(item.id)
                }),
                map(() => {
                    this.toast.success(this.lang.map.msg_delete_success);
                    return true
                }),
                catchError((_) => {
                    this.toast.error(this.lang.map.msg_delete_fail);
                    return of(false)
                })
            )
            .subscribe((success) => {
                if (success) {
                    this.list = this.list.filter(x => x !== item)
                    this.externalSpecialists = this.externalSpecialists.filter(x => x !== item)
                }


            })
    }

    editItem(item: InspectionSpecialist, index: number) {
        this.dialog.show<IDialogData<InspectionSpecialist>>(ExternalSpecialistPopupComponent, {
            model: new InspectionSpecialist().clone(item),
            readonly: false,
            operation: OperationTypes.UPDATE,
        }).onAfterClose$
            .pipe(takeUntil(this.destroy$))
            .pipe(filter((value: InspectionSpecialist): value is InspectionSpecialist => !!value))
            .pipe(
                switchMap((value: InspectionSpecialist) => {

                    return this.actualInspectionService.updateSpecialist(value, this.actualInspection)
                }),
                tap(() => {
                    this.toast.success(this.lang.map.msg_status_x_updated_success.change({ x: this.lang.map.specialist }));
                }),
                catchError((_) => {
                    this.toast.error(this.lang.map.msg_status_x_updated_fail.change({ x: this.lang.map.specialist }));
                    return of(null)
                })
            )
            .subscribe((updatedItem) => {
                if (updatedItem) {
                    const itemIndex = this.list.indexOf(item)
                    this.list = this.list.map((item, i) => {
                        return i === itemIndex ? new InspectionSpecialist().clone(updatedItem) : item
                    })
                    this.externalSpecialists = this.externalSpecialists.map((item, i) => {
                        return i === index ? new InspectionSpecialist().clone(updatedItem) : item
                    })
                }


            })
    }
    viewItem(item: InspectionSpecialist, index: number) {
        this.dialog.show<IDialogData<InspectionSpecialist>>(ExternalSpecialistPopupComponent, {
            model: new InspectionSpecialist().clone(item) ,
            readonly: true,
            operation: OperationTypes.VIEW,
        })
    }
}
