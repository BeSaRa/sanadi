import {Component} from '@angular/core';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {Profile} from '@app/models/profile';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {LangService} from '@app/services/lang.service';
import {ProfileService} from '@app/services/profile.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {of, Subject} from 'rxjs';
import {catchError, exhaustMap, filter, switchMap, takeUntil} from 'rxjs/operators';
import {ProfileTypes} from '@app/enums/profile-types.enum';
import {CharityOrganizationProfileExtraDataService} from '@services/charity-organization-profile-extra-data.service';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss']
})
export class ProfilesComponent extends AdminGenericComponent<Profile, ProfileService> {
  usePagination = true;
  actions: IMenuItem<Profile>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: Profile) => this.edit$.next(item)
    },
    // view
    {
      type: 'action',
      label: 'edit_profile_extra_data',
      icon: ActionIconsEnum.EDIT_PROFILE_EXTRA_DATA,
      onClick: (item: Profile) => this.editProfileExtraData(item),
      disabled: (item: Profile) => !this.enableEditExtraData(item)
    },
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: Profile) => this.view$.next(item)
    },
    // logs
    {
      type: 'action',
      icon: ActionIconsEnum.HISTORY,
      label: 'show_logs',
      onClick: (item: Profile) => this.showAuditLogs(item)
    },
    // activate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      onClick: (item: Profile) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status !== CommonStatusEnum.RETIRED && item.status === CommonStatusEnum.DEACTIVATED;
      }
    },
    // deactivate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_deactivate',
      onClick: (item: Profile) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status !== CommonStatusEnum.RETIRED && item.status === CommonStatusEnum.ACTIVATED;
      }
    }
  ];
  displayedColumns: string[] = ['arName', 'enName', 'status', 'actions'];
  view$: Subject<Profile> = new Subject<Profile>();

  constructor(public service: ProfileService,
              public lang: LangService,
              private charityOrgProfileExtraDataService: CharityOrganizationProfileExtraDataService) {
    super();
  }

  protected _init(): void {
    this.listenToView();
  }

  listenToView(): void {
    this.view$.pipe(
      takeUntil(this.destroy$),
      exhaustMap((model) => {
        return this.service.openViewDialog(model.id).pipe(catchError((_) => of(null)));
      })
    )
      .pipe(
        filter((dialog): dialog is DialogRef => !!dialog),
        switchMap((dialog) => dialog.onAfterClose$)
      )
      .subscribe(() => this.reload$.next(null));
  }

  toggleStatus(model: Profile): void {
    model.updateStatus(model.id, model.status).subscribe(() => {
      this.reload$.next(null);
    });
  }

  showAuditLogs(model: Profile, $event?: MouseEvent): void {
    $event?.preventDefault();
    model.showAuditLogs()
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe();
      });
  }

  editProfileExtraData(item: Profile) {
    switch (item.profileType) {
      case ProfileTypes.CHARITY: {
        this.charityOrgProfileExtraDataService.openCharityOrgExtraDataDialog(item.id).subscribe();
        break;
      }
      case 2: {
        //statements;
        break;
      }
      default: {
        //statements;
        break;
      }
    }
  }

  enableEditExtraData(item: Profile) {
    return item.profileType === ProfileTypes.CHARITY;
  }
}
