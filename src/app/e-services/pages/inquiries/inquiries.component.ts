import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UrlService} from '../../../services/url.service';
import {LangService} from '../../../services/lang.service';
import {InternalDepartmentService} from '../../../services/internal-department.service';
import {InternalDepartment} from '../../../models/internal-department';
import {Observable, Subject} from 'rxjs';
import {filter, map, takeUntil} from 'rxjs/operators';
import {FormManager} from '../../../models/form-manager';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Inquiry} from '../../../models/inquiry';
import {LookupService} from '../../../services/lookup.service';
import {Lookup} from '../../../models/lookup';
import {InquiryService} from '../../../services/inquiry.service';
import {SaveTypes} from '../../../enums/save-types';

@Component({
  selector: 'app-inquiries',
  templateUrl: './inquiries.component.html',
  styleUrls: ['./inquiries.component.scss']
})
export class InquiriesComponent implements OnInit, OnDestroy {
  departments: InternalDepartment[] = [];
  destroy$: Subject<any> = new Subject<any>();
  fm!: FormManager;
  from!: FormGroup;
  categories: Lookup[] = this.lookupService.listByCategory.InquiryCategory;
  save: Subject<SaveTypes> = new Subject();
  saveTypes: typeof SaveTypes = SaveTypes;
  editMode: boolean = false;
  model: Inquiry = new Inquiry();

  constructor(private http: HttpClient,
              private urlService: UrlService,
              private intDepService: InternalDepartmentService,
              private fb: FormBuilder,
              private lookupService: LookupService,
              private inquiryService: InquiryService,
              public lang: LangService) {
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.buildForm();
    this.listenToSave();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private loadDepartments(): void {
    this.intDepService.loadDepartments()
      .pipe(takeUntil(this.destroy$))
      .subscribe(deps => this.departments = deps);
  }

  private buildForm() {
    const inquiry = new Inquiry();
    this.from = this.fb.group(inquiry.getFormData(true));
    this.fm = new FormManager(this.from, this.lang);
  }

  private listenToSave() {
    const finalSave$ = this.save
      .pipe(filter(val => val === SaveTypes.FINAL), map(_ => this.from.value));
    const draftSave$ = this.save
      .pipe(filter(val => val === SaveTypes.DRAFT), map(_ => this.from.value));

    this.listenToDraftSave(draftSave$);
    this.listenToFinalSave(finalSave$);
  }

  private listenToDraftSave(draftSave$: Observable<any>) {
    draftSave$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      const q = (new Inquiry()).clone(value);
      q.draft().subscribe(inquiry => console.log(inquiry));
    });
  }

  private listenToFinalSave(draftSave$: Observable<any>) {
    draftSave$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      const q = (new Inquiry()).clone(value);

      q.save().subscribe((value) => {
        console.log('value', value);
      });
    });
  }

  onCompetentDepChange(depId: number) {
    const dep = this.departments.find(item => item.id === depId);
    dep ? this.setAuthName(dep) : this.setAuthName(null);
  }

  setAuthName(dep: InternalDepartment | null): void {
    this.fm.getFormField('competentDepartmentAuthName')?.setValue(dep ? dep.bawRole.authName : null);
  }
}
