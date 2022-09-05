import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from "@angular/core";
import {
  FormControl,
  FormGroup
} from "@angular/forms";
import { UserClickOn } from "@app/enums/user-click-on.enum";
import { ILanguageKeys } from "@app/interfaces/i-language-keys";
import { DialogService } from "@app/services/dialog.service";
import { LangService } from "@app/services/lang.service";
import { ToastService } from "@app/services/toast.service";
import { ReadinessStatus } from "@app/types/types";
import { NgSelectComponent } from "@ng-select/ng-select";
import { BehaviorSubject, Subject } from "rxjs";
import { map, take, takeUntil, takeWhile,tap } from "rxjs/operators";
import { OrganizationOfficer } from "./../../../../models/organization-officer";

@Component({
  selector: "organizaion-officer",
  templateUrl: "./organizaion-officer.component.html",
  styleUrls: ["./organizaion-officer.component.scss"],
})
export class OrganizaionOfficerComponent implements OnInit {
  constructor(
    public lang: LangService,
    private toastService: ToastService,
    private dialogService: DialogService,
  ) {}

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();
  filterControl: FormControl = new FormControl("");

  k: OrganizationOfficer[] =[];
  private readonly: boolean = true;
  private save$: Subject<any> = new Subject<any>();

  private recordChanged$: Subject<OrganizationOfficer | null> =
    new Subject<OrganizationOfficer | null>();

  private currentRecord?: OrganizationOfficer;
  private _list: OrganizationOfficer[] = [];
  @Input() set list(list: OrganizationOfficer[]) {
    if( this.allowListUpdate === true){
      this._list = list;
      this.listDataSource.next(this._list);
    }
  }
  model: OrganizationOfficer = new OrganizationOfficer();
  get list(): OrganizationOfficer[] {
    return this._list;
  }

  allowListUpdate:boolean=true;
  @Input() pageTitleKey: keyof ILanguageKeys = "menu_organization_user";
  @Input()canUpdate:boolean=true;
  @Input()isClaimed:boolean=false;
  @Input()currentUserOrgId!:number|undefined;

  listDataSource: BehaviorSubject<OrganizationOfficer[]> = new BehaviorSubject<
    OrganizationOfficer[]
  >([])
  ;
  columns = [
    "identificationNumber",
    "fullName",
    "email",
    "phone",
    "extraPhone",
    "actions",
  ];

  private destroy$: Subject<any> = new Subject<any>();

  form!: FormGroup;
  @Input() organizationUsers: OrganizationOfficer[] = [];

  ngOnInit(): void {
    this.listenToRecordChange();
    this.listenToSave();
    if(this.canUpdate === false){
      this.columns= this.columns.slice(0,this.columns.length-1);
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
      this.readonly = record === undefined ? true : false;
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
        map(() => {
          return new OrganizationOfficer().clone({
            ...this.currentRecord,

          });
        })
      )
      .subscribe((model: OrganizationOfficer) => {
        if (!model) {
          return;
        }
        this._updateList(model, "ADD");
        this.toastService.success(this.lang.map.msg_save_success);
      });
  }
  @ViewChild("selectOrganizations")
  ngSelectComponentRef!: NgSelectComponent;
  private _updateList(
    record: OrganizationOfficer | null,
    operation: "ADD" | "DELETE" | "NONE",
    gridIndex: number = -1
  ) {
    if (record) {
      if (operation === "ADD") {
         this.list.push(record);
        this.organizationUsers = this.organizationUsers.filter(
          (user) => user.identificationNumber !== record.identificationNumber
        );
      } else if (operation === "DELETE") {
        this.list.splice(gridIndex, 1);
        this.organizationUsers.push(new OrganizationOfficer().clone(record));
        this.organizationUsers = this.organizationUsers.slice();
      }
    }


    this.sortOrganizations();
    this.ngSelectComponentRef.handleClearClick();

    this.listDataSource.next(this.list);
  }
  delete($event: MouseEvent, record: OrganizationOfficer, index: number): any {
    $event.preventDefault();

    this.dialogService
      .confirm(this.lang.map.msg_confirm_delete_selected)
      .onAfterClose$.pipe(take(1))
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          this._updateList(record, "DELETE", index);
          this.toastService.success(this.lang.map.msg_delete_success);
        }
      });
  }
  onSave() {
    this.save$.next();
  }
  allowAdd() {
    return this.readonly;
  }
  sortOrganizations() {
    this.organizationUsers.sort((a, b) => (a.fullName < b.fullName ? -1 : 1));
    this.list.sort((a, b) => (a.fullName < b.fullName ? -1 : 1));
  }
}
