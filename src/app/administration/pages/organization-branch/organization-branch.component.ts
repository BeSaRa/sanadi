import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, of, Subject, Subscription} from 'rxjs';
import {OrgBranch} from '@app/models/org-branch';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {LookupService} from '@app/services/lookup.service';
import {ToastService} from '@app/services/toast.service';
import {OrganizationBranchService} from '@app/services/organization-branch.service';

import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {debounceTime, switchMap, tap} from 'rxjs/operators';
import {PageComponentInterface} from '@app/interfaces/page-component-interface';
import {OrgUnit} from '@app/models/org-unit';
import {ConfigurationService} from '@app/services/configuration.service';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {cloneDeep as _deepClone} from 'lodash';
import {searchInObject} from '@app/helpers/utils';
import {SharedService} from '@app/services/shared.service';

@Component({
    selector: 'app-organization-branch',
    templateUrl: './organization-branch.component.html',
    styleUrls: ['./organization-branch.component.scss']
})
export class OrganizationBranchComponent implements OnInit, OnDestroy, PageComponentInterface<OrgBranch> {
    add$: Subject<any> = new Subject<any>();
    reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    search$: BehaviorSubject<string> = new BehaviorSubject<string>('');
    internalSearch$: BehaviorSubject<string> = new BehaviorSubject<string>('');
    branches: OrgBranch[] = [];
    branchesClone: OrgBranch[] = [];

    @Input() organization!: OrgUnit;
    displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'phoneNumber1', 'address', 'status', 'statusDateModified', 'actions'];
    reloadSubscription!: Subscription;
    addSubscription!: Subscription;
    searchSubscription!: Subscription;
    internalSearchSubscription!: Subscription;

    selectedRecords: OrgBranch[] = [];
    actionsList: IGridAction[] = [
        {
            langKey: 'btn_delete',
            icon: 'mdi-close-box',
            callback: ($event: MouseEvent) => {
                this.deactivateBulk($event);
            }
        }
    ];

    private _addSelected(record: OrgBranch): void {
        this.selectedRecords.push(_deepClone(record));
    }

    private _removeSelected(record: OrgBranch): void {
        const index = this.selectedRecords.findIndex((item) => {
            return item.id === record.id;
        });
        this.selectedRecords.splice(index, 1);
    }

    get isIndeterminateSelection(): boolean {
        return this.selectedRecords.length > 0 && this.selectedRecords.length < this.branches.length;
    }

    get isFullSelection(): boolean {
        return this.selectedRecords.length > 0 && this.selectedRecords.length === this.branches.length;
    }

    isSelected(record: OrgBranch): boolean {
        return !!this.selectedRecords.find((item) => {
            return item.id === record.id;
        });
    }

    onSelect($event: Event, record: OrgBranch): void {
        const checkBox = $event.target as HTMLInputElement;
        if (checkBox.checked) {
            this._addSelected(record);
        } else {
            this._removeSelected(record);
        }
    }

    // noinspection JSUnusedLocalSymbols
    onSelectAll($event: Event): void {
        if (this.selectedRecords.length === this.branches.length) {
            this.selectedRecords = [];
        } else {
            this.selectedRecords = _deepClone(this.branches);
        }
    }

    constructor(public langService: LangService,
                private dialogService: DialogService,
                private organizationBranchService: OrganizationBranchService,
                public lookupService: LookupService, public configService: ConfigurationService,
                private toast: ToastService,
                private sharedService: SharedService) {
    }

    ngOnDestroy(): void {
        this.reloadSubscription.unsubscribe();
        this.addSubscription.unsubscribe();
        this.searchSubscription?.unsubscribe();
        this.internalSearchSubscription?.unsubscribe();
    }

    ngOnInit(): void {
        this.listenToAdd();
        this.listenToReload();
        this.listenToSearch();
        this.listenToInternalSearch();
    }

    add(): void {
        const sub = this.organizationBranchService.openCreateDialog(this.organization).onAfterClose$.subscribe(() => {
            this.reload$.next(null);
            sub.unsubscribe();
        });
    }

    delete(model: OrgBranch, event: MouseEvent): void {
        event.preventDefault();
        return;
    }

    deactivate(event: MouseEvent, model: OrgBranch): void {
        event.preventDefault();
        const message = this.langService.map.msg_delete_will_change_x_status_to_retired.change({x: this.langService.map.lbl_org_users}) + '<br/>' +
            this.langService.map.msg_confirm_delete_x.change({x: model.getName()});
        this.dialogService.confirm(message).onAfterClose$
            .subscribe((click: UserClickOn) => {
                if (click === UserClickOn.YES) {
                    const sub = model.deactivate().subscribe(() => {
                        this.toast.success(this.langService.map.msg_delete_x_success.change({x: model.getName()}));
                        this.reload$.next(null);
                        sub.unsubscribe();
                    });
                }
            });
    }

    deactivateBulk($event: MouseEvent): void {
        $event.preventDefault();
        if (this.selectedRecords.length > 0) {
            const message = this.langService.map.msg_delete_will_change_x_status_to_retired.change({x: this.langService.map.lbl_org_users}) + '<br/>' +
                this.langService.map.msg_confirm_delete_selected;
            this.dialogService.confirm(message)
                .onAfterClose$.subscribe((click: UserClickOn) => {
                if (click === UserClickOn.YES) {
                    const ids = this.selectedRecords.map((item) => {
                        return item.id;
                    });
                    const sub = this.organizationBranchService.deactivateBulk(ids).subscribe((response) => {
                        this.sharedService.mapBulkResponseMessages(this.selectedRecords, 'id', response)
                            .subscribe(() => {
                                this.reload$.next(null);
                                sub.unsubscribe();
                            });
                    });
                }
            });
        }
    }

    edit(model: OrgBranch, event: MouseEvent): void {
        event.preventDefault();
        const sub = this.organizationBranchService.openUpdateDialog(model.id, this.organization).subscribe((dialog: DialogRef) => {
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
                if (!this.organization || !this.organization.id) {
                    return of([]);
                }
                return this.organizationBranchService.loadByCriteria({'org-id': this.organization?.id});
            })
        ).subscribe((branches) => {
            this.branches = branches;
            this.branchesClone = branches;
            this.selectedRecords = [];
            this.internalSearch$.next(this.search$.value);
        });
    }

    search(searchText: string): void {
        this.search$.next(searchText);
    }

    private listenToSearch(): void {
        this.searchSubscription = this.search$.pipe(
            debounceTime(500)
        ).subscribe((searchText) => {
            this.branches = this.branchesClone.slice().filter((item) => {
                return searchInObject(item, searchText);
            });
        });
    }

    private listenToInternalSearch(): void {
        this.internalSearchSubscription = this.internalSearch$.subscribe((searchText) => {
            this.branches = this.branchesClone.slice().filter((item) => {
                return searchInObject(item, searchText);
            });
        });
    }

    showAuditLogs($event: MouseEvent, branch: OrgBranch): void {
        $event.preventDefault();
        branch.showAuditLogs($event)
            .subscribe((dialog: DialogRef) => {
                dialog.onAfterClose$.subscribe();
            });
    }

}
