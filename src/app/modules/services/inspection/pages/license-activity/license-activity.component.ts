import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { CaseTypes } from '@app/enums/case-types.enum';
import { BaseGenericEService } from '@app/generics/base-generic-e-service';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { PageEvent } from '@app/interfaces/page-event';
import { ActualInspection } from '@app/models/actual-inspection';
import { CaseModel } from '@app/models/case-model';
import { LicenseActivity } from '@app/models/license-activity';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@app/services/dialog.service';
import { InboxService } from '@app/services/inbox.service';
import { LangService } from '@app/services/lang.service';
import { LicenseActivityService } from '@app/services/license-activity.service';
import { TabComponent } from '@app/shared/components/tab/tab.component';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map, skip, startWith, takeUntil } from 'rxjs/operators';
import { ActualInspectionPopupComponent } from '../../popups/actual-inspection-popup/actual-inspection-popup.component';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { ActualInspectionService } from '@app/services/actual-inspection.service';
import { ActualInspectionCreationSource } from '@app/enums/actual-inspection-creation-source.enum';

@Component({
    selector: 'license-activity',
    templateUrl: 'license-activity.component.html',
    styleUrls: ['license-activity.component.scss']
})
export class LicenseActivityComponent implements OnInit, OnDestroy {
    private destroy$: Subject<any> = new Subject<any>();
    private selectedService!: BaseGenericEService<any>;

    searchColumns: string[] = ['licenseNumber', 'caseType', 'licenseType', 'status', 'inspectionDate', 'inspectorId', 'actions'];
    headerColumn: string[] = ['extra-header'];
    form!: UntypedFormGroup;
    // fields: FormlyFieldConfig[] = [];
    results: LicenseActivity[] = [];
    actions: IMenuItem<LicenseActivity>[] = [];
    search$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    tabIndex$: Subject<number> = new Subject<number>();
    defaultDates: string = '';
    fieldsNames: string[] = [];
    filter: string = '';
    searchState: any;
    oldValuesAssigned: boolean = false;

    
    serviceNumbers: number[] = this.inboxService.licenseServices
    serviceControl: UntypedFormControl = new UntypedFormControl(this.serviceNumbers[0]);

    get criteriaTitle(): string {
        return this.lang.map.search_result + (this.results.length ? ' (' + this.results.length + ')' : '');
    };


    constructor(public lang: LangService,
        private activatedRoute: ActivatedRoute,
        public inboxService: InboxService,
        private dialog: DialogService,
        private licenseActivityService: LicenseActivityService,
        private actualInspectionService: ActualInspectionService) {
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.destroy$.unsubscribe();
    }

    ngOnInit(): void {
        this.form = new UntypedFormGroup({});
        this.reSelectService();
        this.listenToServiceChange(this.serviceControl.value);
        this.listenToSearch();
        this.buildGridActions();
    }

    pageEvent: PageEvent = {
        pageIndex: 1,
        pageSize: 10,
        length: 0,
        previousPageIndex: null
    }
    private _isFormBuilt(): boolean {
        return Object.keys(this.form.controls).length > 0
    }
    pageChange($event: PageEvent): void {
        if (!this._isFormBuilt()) return;
        $event.pageIndex++;
        this.pageEvent = $event

        const model = this.prepareCriteriaModel()
        this.search(model)
    }
    private prepareCriteriaModel() {

        const caseType = (this.selectedService.getSearchCriteriaModel()).caseType;
        let criteria = {
            ...this.form.getRawValue(),
            caseType
        };
        return criteria
    }
    private search(criteria: Partial<LicenseActivity>) {


        const paginationOptions = {
            limit: this.pageEvent.pageSize,
            offset: (this.pageEvent.pageIndex * this.pageEvent.pageSize)
        }

        // this.licenseActivityService.loadByFilterPaginate(paginationOptions, criteria)
        this.licenseActivityService.loadAsLookups()
            // .pipe(map(results => {
            //     results.forEach(item => {
            //         item.licenseNumber = '123123123'
            //     })
            //     return results
            // }))
            .subscribe((results) => {

                this.results = results;
                if (this.results.length) {
                    this.tabIndex$.next(1);
                } else {
                    this.dialog.info(this.lang.map.no_result_for_your_search_criteria);
                }
            });

    }



    private listenToServiceChange(serviceNumber?: number) {
        this.serviceControl
            .valueChanges
            .pipe(takeUntil(this.destroy$))
            .pipe(startWith(serviceNumber))
            .pipe(filter(val => !!val))

            .pipe(map(val => Number(val)))
            .pipe(map(val => this.inboxService.getService(val)))
            .subscribe((service: BaseGenericEService<any>) => {
                this.selectedService = service;
                this.results = [];
                this.form.reset();
                //this.setDefaultDates();
            });
    }

    private buildGridActions() {
        this.actions = [

            // inspect
            {
                type: 'action',
                icon: ActionIconsEnum.APPROVE,
                label: 'lbl_inspect',
                show: () => true,
                onClick: (item:LicenseActivity) => this.approve(item)
            },
        ];
    }


    private listenToSearch() {
        this.search$
            .pipe(skip(1))
            .pipe(filter(_ => this.form.valid))
            .pipe(takeUntil(this.destroy$))
            .subscribe(_ => {
                const criteria = this.prepareCriteriaModel();
                this.search(criteria)
            }

            )

    }

  
    get selectedServiceKey(): keyof ILanguageKeys {
        if (!this.selectedService) {
            return 'service_name';
        }
        return this.selectedService.serviceKey;
    }

    resetCriteria() {
        this.form.reset();
        //   this.setDefaultDates();
    }

    selectedTabChanged($event: TabComponent) {
        $event.name === 'result_tab' ? this.serviceControl.disable({ emitEvent: false }) : this.serviceControl.enable({ emitEvent: false });
    }




    // noinspection JSUnusedLocalSymbols
    private reSelectService() {
        const selectedService = parseInt(this.activatedRoute.snapshot.params['caseType']);
        if (isNaN(selectedService)) {
            return;
        }
        this.serviceControl.patchValue(selectedService);
    }
    approve(item:LicenseActivity): void {
       this.actualInspectionService.showCreateActualInspectionPopup(ActualInspectionCreationSource.FOLLOW_UP_SOURCE,
        new ActualInspection().clone({proposedTaskSerial: item.licenseNumber}))
      }

}
