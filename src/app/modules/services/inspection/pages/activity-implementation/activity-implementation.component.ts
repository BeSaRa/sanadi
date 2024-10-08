import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { ActualInceptionStatus } from '@app/enums/actual-inspection-status.enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ActualInspection } from '@app/models/actual-inspection';
import { InspectionLog } from '@app/models/inspection-log';
import { LicenseApprovalModel } from '@app/models/license-approval-model';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { ActualInspectionService } from '@app/services/actual-inspection.service';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { CommentPopupComponent } from '@app/shared/popups/comment-popup/comment-popup.component';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { InspectionLogsPopupComponent } from '../../popups/inspection-logs-popup/inspection-logs-popup.component';
import { InspectionActionLogPopupComponent } from '../../popups/inspection-action-log-popup/inspection-action-log-popup.component';
import { InspectionActionLog } from '@app/models/inspection-action-log';

@Component({
    selector: 'activity-implementation',
    templateUrl: 'activity-implementation.component.html',
    styleUrls: ['activity-implementation.component.scss']
})
export class ActivityImplementationComponent implements OnInit, OnDestroy {




    models: ActualInspection[] = [];
    list$: Subject<ActualInspection[]> = new Subject();
    filterControl: UntypedFormControl = new UntypedFormControl('');
    reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    manage$: Subject<ActualInspection> = new Subject();
    destroy$: Subject<void> = new Subject();
    displayedColumns: string[] = ['taskSerialNumber', 'operationDescription', 'mainOperationType', 'subOperationType', 'status', 'inspectorId', 'actions'];
    actions: IMenuItem<ActualInspection>[] = [

        // view
        {
            type: 'action',
            icon: ActionIconsEnum.VIEW,
            label: 'view',
            onClick: (item: ActualInspection) => this.view(item),
            show: (item: ActualInspection) => [ActualInceptionStatus.REJECTED, ActualInceptionStatus.COMPLETED].includes(item.status)
        },
        // manage
        {
            type: 'action',
            icon: ActionIconsEnum.BRIEFCASE,
            label: 'manage_task',
            onClick: (item: ActualInspection) => this.manage$.next(item),
            show: (item: ActualInspection) => [ActualInceptionStatus.UNDER_INSPECTION, ActualInceptionStatus.TABULATED].includes(item.status)
        },
        // start
        {
            type: 'action',
            icon: ActionIconsEnum.LAUNCH,
            label: 'btn_start',
            onClick: (item: ActualInspection, index) => this.start(item, index),
            show: (item: ActualInspection) => item.status === ActualInceptionStatus.TABULATED,
        },
        // complete
        {
            type: 'action',
            icon: ActionIconsEnum.APPROVED,
            label: 'btn_complete',
            onClick: (item: ActualInspection) => this.approve(item),
            show: (item: ActualInspection) => item.status === ActualInceptionStatus.UNDER_INSPECTION,
            disabled: (item: ActualInspection) => item.licenseActivities.some(x => !x.status)
        },
        // reject
        {
            type: 'action',
            icon: ActionIconsEnum.BLOCK,
            label: 'lbl_reject',
            onClick: (item: ActualInspection) => this.reject(item),
            show: (item: ActualInspection) => item.status === ActualInceptionStatus.UNDER_INSPECTION,
        },
         // history
         {
            type: 'action',
            icon: ActionIconsEnum.HISTORY,
            label: 'inspection_history',
            onClick: (item: ActualInspection) => this._loadHistory(item)
          },
          
        ];



    constructor(public lang: LangService,
        private dialog: DialogService,
        private actualInspectionService: ActualInspectionService,
    ) {

    }
    ngOnInit(): void {
        this._listenToReload();
        this._listenToManage();
        this.reload$.next(null);
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.destroy$.unsubscribe();
    }
    private _listenToManage() {
        this.manage$.pipe(
            switchMap((item: ActualInspection) => {
                return this.actualInspectionService.showUpdateActualInspectionPopup(item)
                    .onAfterClose$
                    .pipe(tap(_ => {
                        this.reload$.next(null)
                    }))
            }),
            takeUntil(this.destroy$),

        ).subscribe();
    }
    view(item: ActualInspection): void {
        this.actualInspectionService.showViewActualInspectionPopup(item)

    }
    private _listenToReload() {
        this.reload$.pipe(
            switchMap((_) => {
               return this.actualInspectionService.loadByInspector().pipe(

                );
                // this.list$ = this.actualInspectionService.loadComposite();
            }),
            tap(list=>{
                this.list$.next(list);
            }),
            takeUntil(this.destroy$)
        )
            .subscribe()
    }
    reject(item: ActualInspection): void {
        this.dialog.show(CommentPopupComponent)
            .onAfterClose$
            .pipe(
                take(1),
                switchMap((comment: string) => {
                    return this.actualInspectionService.reject(item, comment)
                })

            ).subscribe(_ => {
                this.reload$.next(null)
            })
    }
    approve(item: ActualInspection): void {
        this.actualInspectionService.complete(item)
            .pipe(take(1))
            .pipe(tap((_) => this.reload$.next(null)))
            .subscribe()
    }
    start(item: ActualInspection, index: number): void {
        this.actualInspectionService.start(item)
            .pipe(take(1))
            .pipe(tap((_) => this.reload$.next(null)))
            .subscribe()
    }
    private _loadHistory(item: ActualInspection) {
        this.dialog.show<IDialogData<InspectionActionLog[]>>(InspectionActionLogPopupComponent, {
            model: item.inspectionLogs,
            operation: OperationTypes.VIEW
          })
        // this.licenseActivityService.getHistory(item.fullSerial)
        // .pipe(
        //   take(1)
        // )
        // .subscribe((logs: InspectionLog[]) => {
         
        // })
      }
}
