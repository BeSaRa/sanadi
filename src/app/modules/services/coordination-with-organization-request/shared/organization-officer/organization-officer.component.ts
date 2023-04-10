import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {FormGroup, UntypedFormControl} from '@angular/forms';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {UserClickOn} from '@enums/user-click-on.enum';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {DialogService} from '@services/dialog.service';
import {LangService} from '@services/lang.service';
import {ToastService} from '@services/toast.service';
import {ReadinessStatus} from '@app/types/types';
import {NgSelectComponent} from '@ng-select/ng-select';
import {BehaviorSubject, Subject} from 'rxjs';
import {filter, map, take, takeUntil} from 'rxjs/operators';
import {OrganizationOfficer} from '@models/organization-officer';

@Component({
  selector: 'organization-officer',
  templateUrl: './organization-officer.component.html',
  styleUrls: ['./organization-officer.component.scss'],
})
export class OrganizationOfficerComponent implements OnInit {
  constructor(
    public lang: LangService,
    private toastService: ToastService,
    private dialogService: DialogService,
  ) {
  }

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();
  filterControl: UntypedFormControl = new UntypedFormControl('');

  private readonly: boolean = false;
  private save$: Subject<any> = new Subject<any>();

  private recordChanged$: Subject<OrganizationOfficer | null> =
    new Subject<OrganizationOfficer | null>();

  private currentRecord?: OrganizationOfficer;
  private _list: OrganizationOfficer[] = [];
  @Input() set list(list: OrganizationOfficer[]) {
    if (this.allowListUpdate) {
      this._list = list;
      this.dataSource.next(this._list);
    }
  }

  model: OrganizationOfficer = new OrganizationOfficer();

  get list(): OrganizationOfficer[] {
    return this._list;
  }

  allowListUpdate: boolean = true;
  @Input() pageTitleKey: keyof ILanguageKeys = 'menu_organization_user';
  @Input() canUpdate: boolean = true;
  @Input() isClaimed: boolean = false;
  @Input() currentUserOrgId!: number | undefined;

  dataSource: BehaviorSubject<OrganizationOfficer[]> = new BehaviorSubject<OrganizationOfficer[]>([])
  ;
  columns = [
    'fullName',
    'email',
    'phone',
    'extraPhone',
    'actions',
  ];

  private destroy$: Subject<any> = new Subject<any>();

  form!: FormGroup;
  @Input() organizationUsers: OrganizationOfficer[] = [];
  actions: IMenuItem<OrganizationOfficer>[] = [

    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: OrganizationOfficer) => this.delete(item),
      show: (_item: OrganizationOfficer) => !this.readonly
    },

  ];

  ngOnInit(): void {

    this.listenToRecordChange();
    this.listenToSave();
    if (this.canUpdate === false) {
      this.columns = this.columns.slice(0, this.columns.length - 1);
    }

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  listenToRecordChange() {
    this.recordChanged$.pipe(takeUntil(this.destroy$)).subscribe((record) => {
      this.currentRecord = record || undefined;
      this.readonly = !!record;
    });
  }

  onChangeRecord(id: string) {
    const record = this.organizationUsers.find(
      (record) => record.identificationNumber === id
    )!;
    this.recordChanged$.next(record);
  }

  private listenToSave() {

    this.save$
      .pipe(
        takeUntil(this.destroy$),
        filter(() => {
          const isDuplicate = this.list.some((x) => x.identificationNumber === this.currentRecord?.identificationNumber);
          if (isDuplicate) {
            this.toastService.alert(this.lang.map.msg_duplicated_item);
          }
          return !isDuplicate;
        }),
        map(() => {

          return new OrganizationOfficer().clone({
            ...this.currentRecord,
            organizationId: this.currentUserOrgId

          });
        })
      )
      .subscribe((model: OrganizationOfficer) => {
        if (!model) {
          return;
        }
        this._updateList(model, 'ADD');
        this.toastService.success(this.lang.map.msg_save_success);
      });
  }

  @ViewChild('selectOrganizations')
  ngSelectComponentRef!: NgSelectComponent;

  private _updateList(
    record: OrganizationOfficer | null,
    operation: 'ADD' | 'DELETE' | 'NONE',
  ) {
    if (record) {
      if (operation === 'ADD') {
        this.list.push(record);

      } else if (operation === 'DELETE') {
        let index = !this.currentRecord ? -1 : this.list
          .findIndex(x => x.identificationNumber === this.currentRecord?.identificationNumber);
        this.list.splice(index, 1);

      }
    }
    this.ngSelectComponentRef.handleClearClick();

    this.dataSource.next(this.list);
  }

  delete(record: OrganizationOfficer, $event?: MouseEvent): any {
    $event?.preventDefault();

    this.dialogService
      .confirm(this.lang.map.msg_confirm_delete_selected)
      .onAfterClose$.pipe(take(1))
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          this.currentRecord = record;
          this._updateList(record, 'DELETE');
          this.toastService.success(this.lang.map.msg_delete_success);
        }
      });
  }

  onSave() {
    this.save$.next();
  }

  allowAdd() {
    return !this.readonly;
  }

  sortOrganizations() {
    this.organizationUsers.sort((a, b) => (a.fullName < b.fullName ? -1 : 1));
    this.list.sort((a, b) => (a.fullName < b.fullName ? -1 : 1));
  }
}
