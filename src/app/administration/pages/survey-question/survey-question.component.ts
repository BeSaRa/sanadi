import { Component, ViewChild } from '@angular/core';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { SurveyQuestion } from '@app/models/survey-question';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { SurveyQuestionService } from '@app/services/survey-question.service';
import { LangService } from '@app/services/lang.service';
import { IGridAction } from '@app/interfaces/i-grid-action';
import { TableComponent } from '@app/shared/components/table/table.component';
import { DialogService } from '@app/services/dialog.service';
import { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { SharedService } from '@app/services/shared.service';
import { DeleteBulkResult } from '@app/types/types';
import { ToastService } from '@app/services/toast.service';
import { FormBuilder } from '@angular/forms';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { CustomValidators } from '@app/validators/custom-validators';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';

@Component({
  selector: 'survey-question',
  templateUrl: './survey-question.component.html',
  styleUrls: ['./survey-question.component.scss'],
})
export class SurveyQuestionComponent extends AdminGenericComponent<SurveyQuestion, SurveyQuestionService> {
  usePagination = true
  constructor(public service: SurveyQuestionService,
              private dialog: DialogService,
              private sharedService: SharedService,
              private toast: ToastService,
              public lang: LangService,
              private fb: FormBuilder) {
    super();
  }

  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'isFreeText', 'actions'];
  searchColumns: string[] = ['_', 'search_arName', 'search_enName', 'search_isFreeText', 'search_actions'];
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
    }
  }
  protected _init(): void {
    this.buildFilterForm()
  }
  useCompositeToLoad = false;
  @ViewChild(TableComponent)
  table!: TableComponent;
  bulkActions: IGridAction[] = [
    {
      icon: 'mdi-delete',
      callback: () => this.deleteBulk(),
      langKey: 'btn_delete',
    },
  ];
  actions: IMenuItem<SurveyQuestion>[] = [
    {
      type: 'action',
      label: 'btn_edit',
      icon: 'mdi-pen',
      onClick: (item) => {
        this.edit$.next(item);
      },
    },
    {
      type: 'action',
      label: 'btn_delete',
      icon: 'mdi-delete',
      onClick: (item) => {
        this.deleteQuestion(item);
      },
    },
     // logs
     {
      type: 'action',
      icon: ActionIconsEnum.HISTORY,
      label: 'show_logs',
      onClick: (item) => this.showAuditLogs(item)
    },
  ];

  deleteQuestion(q: SurveyQuestion): void {
    this.dialog.confirm(this.lang.map.msg_confirm_delete_selected)
      .onAfterClose$
      .pipe(filter(click => click === UserClickOn.YES))
      .pipe(switchMap(() => q.delete()))
      .subscribe((_) => {
        this.toast.success(this.lang.map.msg_delete_x_success.change({ x: q.getName() }));
        this.models = this.models.filter(item => item.id !== q.id);
      });
  }

  deleteBulk(): void {
    if (this.table.selection.isEmpty()) {
      return;
    }
    this.dialog.confirm(this.lang.map.msg_confirm_delete_selected)
      .onAfterClose$
      .pipe(filter(click => click === UserClickOn.YES))
      .pipe(switchMap(() => this.service.deleteBulk((this.table.selection.selected as SurveyQuestion[]).map(item => item.id))))
      .pipe(switchMap<Record<number, boolean>, Observable<DeleteBulkResult<SurveyQuestion>>>((response) => {
        return this.sharedService.mapBulkResponseMessages(this.table.selection.selected.slice(), 'id', response);
      }))
      .subscribe((result) => {
        const ids = result.success.map(item => item.id);
        if (result.result === 'SUCCESS' || result.result === 'PARTIAL_SUCCESS') {
          this.models = this.models.filter(item => !ids.includes(item.id));
        }
        this.table && this.table.clearSelection();
      });
  }
  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      arName: [''], enName: [''], isFreeText: [null]
    })
  }
}
