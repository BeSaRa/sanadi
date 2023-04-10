import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {InternalDepartment} from '@app/models/internal-department';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {Observable, of, Subject} from 'rxjs';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {LangService} from '@app/services/lang.service';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {TeamService} from '@app/services/team.service';
import {Team} from '@app/models/team';
import {InternalUser} from '@app/models/internal-user';
import {InternalUserService} from '@app/services/internal-user.service';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {catchError, switchMap, takeUntil} from 'rxjs/operators';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {BlobModel} from '@app/models/blob-model';
import {SafeResourceUrl} from '@angular/platform-browser';
import {FileExtensionsEnum} from '@app/enums/file-extension-mime-types-icons.enum';

@Component({
  selector: 'internal-department-popup',
  templateUrl: './internal-department-popup.component.html',
  styleUrls: ['./internal-department-popup.component.scss']
})
export class InternalDepartmentPopupComponent extends AdminGenericDialog<InternalDepartment> implements AfterViewInit {
  form!: UntypedFormGroup;
  model!: InternalDepartment;
  operation!: OperationTypes;
  teams: Team[] = [];
  internalUsers: InternalUser[] = [];
  saveVisible = true;
  @ViewChild('stampUploader') stampUploader!: ElementRef;
  stampPath!: SafeResourceUrl;
  stampFile: any;
  stampExtensions: string[] = [FileExtensionsEnum.PNG, FileExtensionsEnum.JPG, FileExtensionsEnum.JPEG];
  saveStamp$: Subject<void> = new Subject<void>();
  tabsData: IKeyValue = {
    basic: {name: 'basic'},
    stamp: {name: 'stamp'}
  };
  blob!: BlobModel;
  teamInfo!: Team;
  @ViewChild('dialogContent') dialogContent!: ElementRef;

  constructor(public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              public lang: LangService,
              private cd: ChangeDetectorRef,
              @Inject(DIALOG_DATA_TOKEN) data: IDialogData<InternalDepartment>,
              private teamService: TeamService,
              private internalUserService: InternalUserService,
              private dialogService: DialogService,
              private toast: ToastService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.teamInfo = data.model.mainTeam;
  }

  initPopup(): void {
    this.loadTeams();
    this.loadInternalUsers();
    this.listenToSaveStamp();
    this.setCurrentStamp();
  }

  private _afterViewInit(): void {
    if (this.operation === OperationTypes.UPDATE) {
      this.displayFormValidity(null, this.dialogContent.nativeElement);
    }

    if (this.operation === OperationTypes.VIEW) {
      this.form.disable();
    }
  }

  ngAfterViewInit(): void {
    // used the private function to reuse functionality of afterViewInit if needed
    this._afterViewInit();
    this.cd.detectChanges();
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  beforeSave(model: InternalDepartment, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: InternalDepartment, form: UntypedFormGroup): Observable<InternalDepartment> | InternalDepartment {
    return (new InternalDepartment()).clone({...model, ...form.value});
  }

  afterSave(model: InternalDepartment, dialogRef: DialogRef): void {
    let message = '';
    if (this.operation === OperationTypes.UPDATE) {
      message = this.lang.map.msg_update_x_success;
      dialogRef.close(model)
    }

    if (this.operation === OperationTypes.CREATE) {
      message = this.lang.map.msg_create_x_success;
      this.operation = OperationTypes.UPDATE
    }
    this.toast.success(message.change({x: model.getName()}));
  }

  saveFail(error: Error): void {
  }

  loadTeams() {
    this.teamService.load().subscribe(data => {
      this.teams = data;
    })
  }

  loadInternalUsers() {
    this.internalUserService.load().subscribe(data => {
      this.internalUsers = data;
    })
  }

  openFileBrowser($event: MouseEvent): void {
    $event?.stopPropagation();
    $event?.preventDefault();
    this.stampUploader?.nativeElement.click();
  }

  onStampSelected($event: Event): void {
    this.saveStampAfterSelect($event);
  }

  private _clearStampUploader(): void {
    this.stampFile = null;
    this.stampUploader.nativeElement.value = "";
  }

  removeStamp($event: MouseEvent): void {
    $event.preventDefault();
    this.stampPath = '';
    this._clearStampUploader();
  }

  listenToSaveStamp() {
    this.saveStamp$.pipe(
      takeUntil(this.destroy$),
      switchMap(() => {
        return this.model.saveStamp(this.stampFile).pipe(
          catchError(_ => of(null))
        );
      })
    ).subscribe((success) => {
      if (success) {
        this.toast.success(this.lang.map.msg_save_stamp_for_x_success.change({x: this.model.getName()}));
      }
    })
  }

  saveStampAfterSelect($event: Event) {
    let files = ($event.target as HTMLInputElement).files;
    if (files && files[0]) {
      const extension = files[0].name.getExtension().toLowerCase();
      if (this.stampExtensions.indexOf(extension) === -1) {
        this.dialogService.error(this.lang.map.msg_invalid_format_allowed_formats.change({formats: this.stampExtensions.join(', ')}));
        this.stampPath = '';
        this._clearStampUploader();
        return;
      }

      let reader = new FileReader();
      reader.readAsDataURL(files[0]);

      reader.onload = (event) => {
        // @ts-ignore
        this.stampPath = event.target.result as string;
        // @ts-ignore
        this.stampFile = files[0];

        // save stamp file to department
        this.saveStamp$.next();
      };
    }
  }

  setCurrentStamp() {
    this.model.getStamp().subscribe((file) => {
      if (file.blob.type === 'error' || file.blob.size === 0) {
        return;
      }
      this.blob = file;
      this.stampPath = file.safeUrl;
    });
  }

  destroyPopup(): void {
    this.blob.dispose();
  };

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.lang.map.add_new_internal_department;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.edit_internal_department;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  }

  setDialogButtonsVisibility(tab: any): void {
    this.saveVisible = this.operation === OperationTypes.VIEW ? false : (tab.name && tab.name === this.tabsData.basic.name);
    this.validateFieldsVisible = this.operation === OperationTypes.VIEW ? false : (tab.name && tab.name === this.tabsData.basic.name);
  }
}
