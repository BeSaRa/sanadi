import { Component, Inject } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ActualInspectionCreationSource } from '@app/enums/actual-inspection-creation-source.enum';
import { FileExtensionsEnum } from '@app/enums/file-extension-mime-types-icons.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ActualInspection } from '@app/models/actual-inspection';
import { FileNetDocument } from '@app/models/file-net-document';
import { GlobalSettings } from '@app/models/global-settings';
import { InternalUser } from '@app/models/internal-user';
import { ActualInspectionService } from '@app/services/actual-inspection.service';
import { DialogService } from '@app/services/dialog.service';
import { InternalUserService } from '@app/services/internal-user.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { TabMap } from '@app/types/types';
import { Observable } from 'rxjs';

@Component({
  selector: 'manage-inspection-popup',
  templateUrl: 'manage-inspection-popup.component.html',
  styleUrls: ['manage-inspection-popup.component.scss']
})
export class ManageInspectionPopupComponent {
  model: ActualInspection;
  inspectors$: Observable<InternalUser[]> = new Observable<InternalUser[]>

  tabsData: TabMap = {
    activities: {
      name: 'activitiesTab',
      langKey: 'lbl_license_activities',
      index: 0,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => true
    },
    specialists: {
      name: 'specialistsTab',
      langKey: 'lbl_external_specialists',
      index: 1,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => true
    },
    inspector: {
      name: 'inspectorTab',
      langKey: 'lbl_inspector',
      index: 2,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => true
    },
  };
  inspectorControl!: UntypedFormControl;

  readonly:boolean = false;

  constructor(public lang: LangService,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<ActualInspection>&{readonly:boolean},
    private internalUserService: InternalUserService,
    private actualInspectionService: ActualInspectionService,
    private dialog:DialogService,
    private toast:ToastService
  ) {

    this.model = data.model;
    this.readonly = data.readonly;
    this.inspectors$ = this.internalUserService.getInspectors();
    this.inspectorControl = new UntypedFormControl(this.model.inspectorId)
    if(this.readonly){
      this.inspectorControl.disable();
    }

  }

  changeInspector($event:MouseEvent){
    $event.preventDefault();
    const message = this.lang.map.msg_confirm_change_inspector;
    this.dialog.confirm(message)
    .onAfterClose$.subscribe((click: UserClickOn) => {
    if (click === UserClickOn.YES) {
      const sub = this.actualInspectionService.changeInspector(this.model,this.inspectorControl.value).subscribe(() => {
        this.toast.success(this.lang.map.inspectorChangedSuccess);
        sub.unsubscribe();
      });
    }
  });
  }
}
