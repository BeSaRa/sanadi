import {Directive, EventEmitter, Input, OnDestroy, OnInit} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {OperationTypes} from "@app/enums/operation-types.enum";
import {SaveTypes} from "@app/enums/save-types";
import {IESComponent} from "@app/interfaces/iescomponent";
import {BehaviorSubject, isObservable, Observable, of, Subject} from "rxjs";
import {
  catchError,
  delay,
  exhaustMap,
  filter,
  map,
  skip,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom
} from "rxjs/operators";
import {ICaseModel} from "@app/interfaces/icase-model";
import {EServiceGenericService} from "@app/generics/e-service-generic-service";
import {LangService} from "@app/services/lang.service";
import {CaseModel} from "@app/models/case-model";
import {CaseStatus} from "@app/enums/case-status.enum";
import {OpenFrom} from '@app/enums/open-from.enum';

@Directive()
export abstract class EServicesGenericComponent<M extends ICaseModel<M>, S extends EServiceGenericService<M>> implements OnInit, OnDestroy, IESComponent<M> {
  onModelChange$: EventEmitter<M | undefined> = new EventEmitter<M | undefined>();
  accordionView: boolean = false;
  saveTypes: typeof SaveTypes = SaveTypes;
  save: Subject<SaveTypes> = new Subject<SaveTypes>();
  launch$: Subject<null> = new Subject<null>();
  resetForm$: Subject<null> = new Subject<null>();
  fromDialog: boolean = false;
  openFrom: OpenFrom = OpenFrom.ADD_SCREEN;
  readonly: boolean = false;
  allowEditRecommendations?: boolean | undefined;
  operationTypes: typeof OperationTypes = OperationTypes;
  operation: OperationTypes = OperationTypes.CREATE;
  modelChange$: BehaviorSubject<M | undefined> = new BehaviorSubject<M | undefined>(this._getNewInstance());
  destroy$: Subject<any> = new Subject<any>();
  model?: M

  formValidity$: Subject<any> = new Subject<any>();

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
    of(null)
      .pipe(tap(_ => this._initComponent()))
      .pipe(tap(_ => this._buildForm()))
      .pipe(tap(_ => this._listenToSave()))
      .pipe(tap(_ => this._listenToModelChange()))
      .pipe(tap(_ => this._listenToResetForm()))
      .pipe(tap(_ => this._listenToLaunch()))
      .pipe(tap(_ => this._listenToValidateForms()))
      .pipe(delay(0))// delay
      .pipe(tap(_ => this._afterBuildForm()))
      .subscribe()
  }

  @Input()
  set outModel(model: M | undefined) {
    this.operation = OperationTypes.UPDATE;
    this.modelChange$.next(model);
  }

  get outModel(): M | undefined {
    return this.modelChange$.value;
  }

  _saveModel(model: M, saveType: SaveTypes): Observable<{ saveType: SaveTypes, model: M }> {
    const modelInstance = model as unknown as CaseModel<any, any>;
    const type = (!modelInstance.canSave() && saveType === SaveTypes.FINAL) ? SaveTypes.COMMIT : saveType;
    return model[this.saveMethods[type]]().pipe(map(m => ({saveType: type, model: m})));
  }

  _listenToSave(): void {
    this.save
      .pipe(
        // before save
        switchMap(saveType => {
          const result = this._beforeSave(saveType);
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
            return of({saveType: saveType, model: null});
          }))
        }),
        // allow only success save
        filter((model: { saveType: SaveTypes, model: M | null }): model is { saveType: SaveTypes, model: M } => !!model.model)
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this._afterSave(result.model, result.saveType, this.operation)
        this.operation = OperationTypes.UPDATE;
      })
  }

  _listenToModelChange(): void {
    this.modelChange$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(model => this.operation === OperationTypes.CREATE ? this.model = model : null))
      .pipe(switchMap(model => {
        return this.operation === OperationTypes.UPDATE ? of(model) : of(model).pipe(skip(1));
      }))
      .subscribe((model) => {
        model && this._updateForm(model);
      })
  }

  _listenToResetForm(): void {
    this.resetForm$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.operation = OperationTypes.CREATE;
        this._resetForm();
      });
  }

  _listenToLaunch() {
    this.launch$
      .pipe(
        switchMap(_ => {
          const result = this._beforeLaunch();
          return isObservable(result) ? result : of(result)
        }),
        exhaustMap(_ => {
          const model = this.model as unknown as CaseModel<any, any>
          return model.start().pipe(catchError(error => {
            this._launchFail(error);
            return of(false);
          }));
        }),
        filter<boolean | null, boolean>((value): value is boolean => {
          return !!value;
        }),
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        (this.model as unknown as CaseModel<any, any>).caseStatus = CaseStatus.STARTED;
        this._afterLaunch();
      })
  }

  _listenToValidateForms(): void {
    this.formValidity$
      .pipe(takeUntil(this.destroy$))
      .pipe(withLatestFrom(of(this._validateForms())))
      .subscribe(([element, forms]) => {
        if (!forms || !forms.length) {
          return;
        }
        forms.forEach(form => form.markAllAsTouched());
        if (!element) {
          return;
        }
        let ele: HTMLElement | null = null;
        if (typeof element === 'string') {
          ele = document.getElementById(element);
        } else if (element instanceof HTMLElement) {
          ele = element;
        }
        ele?.scrollTo({top: 0, behavior: "smooth"});
      })
  }

  abstract _getNewInstance(): M;

  abstract _initComponent(): void;

  abstract _buildForm(): void;

  abstract _afterBuildForm(): void;

  abstract _beforeSave(saveType: SaveTypes): boolean | Observable<boolean>;

  abstract _beforeLaunch(): boolean | Observable<boolean>;

  abstract _afterLaunch(): void ;

  abstract _prepareModel(): M | Observable<M>;

  abstract _afterSave(model: M, saveType: SaveTypes, operation: OperationTypes): void;

  abstract _saveFail(error: any): void;

  abstract _launchFail(error: any): void;

  abstract _destroyComponent(): void;

  abstract _updateForm(model: M | undefined): void;

  abstract _resetForm(): void;

  /**
   * @description return here array of forms that you need to make it as touched to display the validation message below it
   */
  _validateForms(): FormGroup[] {
    return [this.form]
  }
}
