import {Component, Inject} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {Subject} from 'rxjs';
import {LangService} from '@app/services/lang.service';
import {switchMap, takeUntil} from 'rxjs/operators';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {FollowupService} from '@app/services/followup.service';
import {Followup} from '@app/models/followup';
import {CaseModel} from '@app/models/case-model';

@Component({
  selector: 'followup',
  templateUrl: './followup.component.html',
  styleUrls: ['./followup.component.scss']
})
export class FollowupComponent extends AdminGenericComponent<Followup, FollowupService>{

  actions: IMenuItem<Followup>[] = [];
  displayedColumns: string[] = ['requestNumber', 'name', 'serviceType', 'dueDate', 'status', 'orgInfo'];
  searchText = '';
  addFollowup$: Subject<any> = new Subject<any>();
  case!: CaseModel<any, any>;
  showForm = false;


  constructor(
              public lang: LangService,
              public service: FollowupService,
              @Inject(DIALOG_DATA_TOKEN)
              public data: CaseModel<any, any>) {
    super();
    this.case = data;
    this.case.id = '{32570E7B-74E6-C661-8428-801D8FE00000}';
  }

  filterCallback = (record: any, searchText: string) => {
    return record.search(searchText);
  };

  _init() {
    //this.reload$.next(this.case.id);
    this.listenToAddFollowup();
    this.reload$.next(this.case.id);
  }

  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(switchMap((caseId: string) => {
        return this.service.getByCaseId(caseId);
      }))
      .subscribe((list: Followup[]) => {
        this.models = list;
        if(!this.models || !this.models.length)
          this.showForm = true;
      });
  }

  listenToAddFollowup(): void {
    this.addFollowup$
      .pipe(takeUntil(this.destroy$)).subscribe(() =>{
      this.showForm = true;
    })
  }

  hideForm(){
    this.showForm = false;
    this.reload$.next(this.case.id)
  }

}
