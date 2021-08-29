import {Directive, Input, OnDestroy, OnInit} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {OperationTypes} from "@app/enums/operation-types.enum";
import {SaveTypes} from "@app/enums/save-types";
import {IESComponent} from "@app/interfaces/iescomponent";
import {BehaviorSubject, isObservable, Observable, of, Subject} from "rxjs";
import {catchError, exhaustMap, filter, switchMap, takeUntil, withLatestFrom} from "rxjs/operators";
import {ICaseModel} from "@app/interfaces/icase-model";
import {EServiceGenericService} from "@app/generics/e-service-generic-service";
import {LangService} from "@app/services/lang.service";

@Directive()
export abstract class EServicesGenericComponent<M extends ICaseModel<M>, S extends EServiceGenericService<M>> implements OnInit, OnDestroy, IESComponent {
  saveTypes: typeof SaveTypes = SaveTypes;
  save: Subject<SaveTypes> = new Subject<SaveTypes>();
  resetForm$: Subject<null> = new Subject<null>();
  fromDialog: boolean = false;
  readonly: boolean = false;
  allowEditRecommendations?: boolean | undefined;
  operation: OperationTypes = OperationTypes.CREATE;
  modelChange$: BehaviorSubject<M | undefined> = new BehaviorSubject<M | undefined>(undefined);
  destroy$: Subject<any> = new Subject<any>();
  model?: M
  abstract lang: LangService;
  abstract form: FormGroup;
  abstract fb: FormBuilder;
  abstract service: S;

  private saveMethods: Record<SaveTypes, keyof Omit<ICaseModel<M>, 'id'>> = {
    [SaveTypes.FINAL]: "save",
    [SaveTypes.COMMIT]: "commit",
    [SaveTypes.DRAFT]: "draft"
  };

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
    this.destroy$.unsubscribe();
    this._destroyComponent();
  }

  ngOnInit(): void {
    this._initComponent();
    this._buildForm();
    this._listenToSave();
    this._listenToModelChange();
    this._listenToResetForm();
  }

  @Input()
  set outModel(model: M | undefined) {
    this.modelChange$.next(model);
  }

  get outModel(): M | undefined {
    return this.modelChange$.value;
  }

  _saveModel(model: M, saveType: SaveTypes): Observable<M> {
    return model[this.saveMethods[saveType]]();
  }

  _listenToSave(): void {
    this.save
      .pipe(
        // before save
        switchMap(_ => {
          const result = this._beforeSave();
          return isObservable(result) ? result : of(result);
        }),
        // emit only if the beforeSave returned true
        filter(value => !!value),
        // prepare model
        switchMap(_ => {
          const model = this._prepareModel();
          return isObservable(model) ? model : of(model);
        }),
        // with save type
        withLatestFrom(this.save),
        // calling the save method
        exhaustMap(([model, saveType]) => {
          return this._saveModel(model, saveType).pipe(catchError(error => {
            // handle the errors came from backend
            this._saveFail(error);
            return of(null);
          }))
        }),
        // allow only success save
        filter((model: M | null): model is M => !!model)
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((model) => {
        this._afterSave(model)
      })
  }

  _listenToModelChange(): void {
    this.modelChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe((model) => {
        model && this._updateForm(model);
      })
  }

  _listenToResetForm(): void {
    this.resetForm$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this._resetForm();
      });
  }

  abstract _initComponent(): void;

  abstract _buildForm(): void;

  abstract _beforeSave(): boolean | Observable<boolean>;

  abstract _prepareModel(): M | Observable<M>;

  abstract _afterSave(model: M): void;

  abstract _saveFail(error: any): void;

  abstract _destroyComponent(): void;

  abstract _updateForm(model: M): void;

  abstract _resetForm(): void;
}
