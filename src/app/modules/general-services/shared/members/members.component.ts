import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ControlWrapper } from '@app/interfaces/i-control-wrapper';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { Member } from '@app/models/member';
import { JobTitleService } from '@app/services/job-title.service';
import { LangService } from '@app/services/lang.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
})
export class MembersComponent implements OnInit {
  @Input() readonly!: boolean;
  @Input() set list(_list: Member[]) {
    this._list = _list;
  }
  @Input() pageTitle!: keyof ILanguageKeys;
  _list: Member[] = [];
  model: Member = new Member();
  controls = this.getFormControls();
  form!: UntypedFormGroup;
  showForm = false;
  editRecordIndex = -1;
  add$: Subject<null> = new Subject<null>();
  save$: Subject<Member> = new Subject<Member>();
  private destroy$: Subject<any> = new Subject<any>();
  columns = ['name', 'position', 'personalNumber'];
  constructor(private fb: UntypedFormBuilder, public lang: LangService, private jobTitleService: JobTitleService) { }
  ngOnInit(): void {
    this.form = this.fb.group(this.model.buildForm());
    this.listenToModelChange();
    this.listenToAdd();
  }

  getFormControls(): ControlWrapper[] {
    return [
      {
        controlName: 'name',
        label: this.lang.map.name,
      },
      {
        controlName: 'personalNumber',
        label: this.lang.map.personal_number,
      },
      {
        controlName: 'position',
        label: this.lang.map.job_title,
        load$: this.jobTitleService.loadAsLookups(),
      }
    ];
  }
  save(): void {
    const value = this.form.value;
    const model = new Member().clone({
      ...value,
    });
    this.save$.next(model);
  }
  listenToAdd(): void {
    this.add$.pipe(takeUntil(this.destroy$)).subscribe(
      _ => {
        this.showForm = true;
      }
    );
  }

  listenToModelChange(): void {
    this.save$.pipe(takeUntil(this.destroy$)).subscribe((model) => {
      this.model = model;
      this._list = [...this._list, this.model];
    });
  }
  cancel(): void {
    this.form.reset();
    this.showForm = false;
  }
}
