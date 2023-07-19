import { AfterViewInit, Directive, Input } from '@angular/core';
import { IFindInList } from '@contracts/i-find-in-list';
import { IMenuItem } from '@modules/context-menu/interfaces/i-menu-item';
import { AuditOperationTypes } from '@enums/audit-operation-types';
import { ObjectUtils } from '@helpers/object-utils';
import { IValueDifference } from '@contracts/i-value-difference';
import { AdminResult } from '@models/admin-result';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CaseAuditService } from '@services/case-audit.service';
import { CaseTypes } from '@enums/case-types.enum';
import { IAuditModelProperties } from '@contracts/i-audit-model-properties';
import { LangService } from '@services/lang.service';
import { CommonUtils } from '@helpers/common-utils';

@Directive()
export abstract class AuditListGenericComponent<M extends IAuditModelProperties<M>> implements AfterViewInit {
  @Input() newVersionList: M[] = [];
  @Input() oldVersionList: M[] = [];
  @Input() caseType?: CaseTypes;
  @Input() uniqueComparisonProperty?: keyof M;

  ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      this._afterViewInit();
    })
  }

  protected _afterViewInit(): void {
    this.getDifferencesList();
  }

  list: M[] = [];
  auditOperationTypes = AuditOperationTypes;

  abstract lang: LangService;
  abstract caseAuditService: CaseAuditService;
  abstract actions: IMenuItem<M>[];
  abstract displayColumns: string[];

  abstract _getNewInstance(override?: Partial<M>): M;

  abstract getControlLabels(item: M): { [key: string]: ControlValueLabelLangKey };

  // abstract getDifferencesPopupTitle(item: M): AdminResult;

  private rowClassByOperationType = {
    [AuditOperationTypes.ADDED]: 'bg-added-row',
    [AuditOperationTypes.UPDATED]: 'bg-updated-row',
    [AuditOperationTypes.DELETED]: 'bg-deleted-row',
    [AuditOperationTypes.NO_CHANGE]: ''
  };

  getAuditRowClass(auditOperation: AuditOperationTypes) {
    return this.rowClassByOperationType[auditOperation] ?? '';
  }

  /**
   * @description Get the differences between new version and old version in list format.
   *
   *
   * (deleted) If old version has value and new version does not have.
   *
   * (added) If new version has value and old version does not have.
   *
   * (updated) If both (new and old) versions have value and there is at least 1 difference.
   *
   * (no change) otherwise.
   */
  getDifferencesList(): void {
    this.list = [];
    // get the newly added records
    debugger
    this.newVersionList.forEach((newVersionItem: M) => {
      if (!this.existsInList({
        itemToCompare: newVersionItem,
        listToCompareWith: this.oldVersionList,
        propertyToCompare: this.uniqueComparisonProperty
      })) {
        this.list.push(this._getNewInstance({
          ...newVersionItem,
          auditOperation: AuditOperationTypes.ADDED
        }));
      }
    });

    // get deleted and updated records
    this.oldVersionList.forEach((oldVersionItem: M) => {
      const newVersionItem = this.existsInList({
        itemToCompare: oldVersionItem,
        listToCompareWith: this.newVersionList,
        propertyToCompare: this.uniqueComparisonProperty
      });
      if (!newVersionItem) {
        this.list.push(this._getNewInstance({
          ...oldVersionItem,
          auditOperation: AuditOperationTypes.DELETED
        }));
      } else {
        const newVersionDataModel: Partial<M> = ObjectUtils.getControlComparisonValues<M>(this.getControlLabels(newVersionItem));
        const oldVersionDataModel: Partial<M> = ObjectUtils.getControlComparisonValues<M>(this.getControlLabels(oldVersionItem));
        if (ObjectUtils.hasValueDifference(newVersionDataModel, oldVersionDataModel)) {
          this.list.push(this._getNewInstance({
            ...oldVersionItem,
            auditOperation: AuditOperationTypes.UPDATED
          }));
        }
      }
    })
  }

  /**
   * @description Opens the popup to show the difference between 2 versions of record.
   * @param item
   */
  showRecordDifferences(item: M): void {
    debugger
    if (item.auditOperation === AuditOperationTypes.NO_CHANGE) {
      return;
    }
    const labelLangKeys = ObjectUtils.getControlLabels(this.getControlLabels(item));
    let differencesList: IValueDifference[] = [];
    let newVersionFullModel: M;
    let oldVersionFullModel: M;
    let newVersionDataModel: Partial<M> = {};
    let oldVersionDataModel: Partial<M> = {};

    if (item.auditOperation === AuditOperationTypes.DELETED) {
      newVersionFullModel = this._getNewInstance();
      oldVersionFullModel = item;
    } else if (item.auditOperation === AuditOperationTypes.ADDED) {
      newVersionFullModel = item;
      oldVersionFullModel = this._getNewInstance();
    } else {
      const newVersionItem = this.existsInList({
        itemToCompare: item,
        listToCompareWith: this.newVersionList,
        propertyToCompare: this.uniqueComparisonProperty
      });
      if (!newVersionItem) {
        return;
      }
      newVersionFullModel = newVersionItem;
      oldVersionFullModel = item;
    }
    newVersionDataModel = ObjectUtils.getControlComparisonValues<M>(this.getControlLabels(newVersionFullModel));
    oldVersionDataModel = ObjectUtils.getControlComparisonValues<M>(this.getControlLabels(oldVersionFullModel));
    differencesList = ObjectUtils.getValueDifferencesList<M, M>(newVersionFullModel, oldVersionFullModel, newVersionDataModel, oldVersionDataModel, labelLangKeys);

    this.caseAuditService.showDifferencesPopup(differencesList, this.getDifferencesPopupTitle(item));
  }

  /**
   * @description Checks if the item exists in list provided to compare.
   *
   *
   * Compares "uniqueComparisonProperty" by default.
   *
   * Override if custom comparison is needed.
   *
   * @param objComparison
   */
  existsInList(objComparison: IFindInList<M>): M | undefined {
    if (!CommonUtils.isValidValue(this.uniqueComparisonProperty)) {
      return undefined;
    }
    return objComparison.listToCompareWith.find((item) => item[this.uniqueComparisonProperty!] === objComparison.itemToCompare[this.uniqueComparisonProperty!]);
  }

  /**
   * @description Returns the title as AdminResult for title of popup
   *
   *
   * Result will be appended to popup title
   * @param item
   */
  getDifferencesPopupTitle(item: M): AdminResult | undefined {
    if (this.uniqueComparisonProperty) {
      return AdminResult.createInstance({
        arName: item[this.uniqueComparisonProperty!] as string,
        enName: item[this.uniqueComparisonProperty!] as string
      })
    }
    return undefined;
  }
}
