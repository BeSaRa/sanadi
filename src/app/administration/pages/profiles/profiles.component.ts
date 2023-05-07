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
import {SortEvent} from '@contracts/sort-event';
import {CommonUtils} from '@helpers/common-utils';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { CustomValidators } from '@app/validators/custom-validators';
import { LookupService } from '@app/services/lookup.service';
import { FormBuilder } from '@angular/forms';

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
  displayedColumns: string[] = ['arName', 'enName', 'profileType', 'status', 'actions'];
  searchColumns: string[] = ['search_arName', 'search_enName','search_profileType', 'search_status', 'search_actions'];
  searchColumnsConfig: SearchColumnConfigMap = {
    search_arName: {
      key: 'arName',
      controlType: 'text',
      property: 'arName',
      label: 'arabic_name',
      maxLength: CustomValidators.defaultLengths.ARABIC_NAME_MAX
    },
    search_enName: {
      key: 'enName',
      controlType: 'text',
      property: 'enName',
      label: 'english_name',
      maxLength: CustomValidators.defaultLengths.ENGLISH_NAME_MAX
    },
    search_profileType:{
      key:'profileType',
      controlType:'select',
      property:'profileType',
      label:'lbl_profile_type',
      selectOptions: {
        options: this.lookupService.listByCategory.ProfileType,
        labelProperty:'getName',
        optionValueKey:'lookupKey'
      }
    },
    search_status: {
      key: 'status',
      controlType: 'select',
      property: 'status',
      label: 'lbl_status',
      selectOptions: {
        options: this.lookupService.listByCategory.CommonStatus.filter(status => !status.isRetiredCommonStatus()),
        labelProperty: 'getName',
        optionValueKey: 'lookupKey'
      }
    }
  }

  view$: Subject<Profile> = new Subject<Profile>();

  constructor(public service: ProfileService,
              public lang: LangService,
              private charityOrgProfileExtraDataService: CharityOrganizationProfileExtraDataService,
              private lookupService: LookupService,
              private fb:FormBuilder) {
    super();
  }

  protected _init(): void {
    this.listenToView();
    this.buildFilterForm();
  }

  sortingCallbacks = {
    profileType: (a: Profile, b: Profile, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.profileTypeInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.profileTypeInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    status: (a: Profile, b: Profile, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
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

  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      arName: [''], enName: [''], profileType: [null], status: [null]
    })
  }
}
