import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {TraineeService} from '@app/services/trainee.service';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {Certificate} from '@app/models/certificate';
import {CertificateService} from '@app/services/certificate.service';
import {Subject} from 'rxjs';
import {switchMap, takeUntil} from 'rxjs/operators';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {UserClickOn} from '@app/enums/user-click-on.enum';

@Component({
  selector: 'select-certificate-template-popup',
  templateUrl: './select-certificate-template-popup.component.html',
  styleUrls: ['./select-certificate-template-popup.component.scss']
})
export class SelectCertificateTemplatePopupComponent implements OnInit, OnDestroy {
  trainingProgramId!: number;
  models: Certificate[] = [];
  displayedColumns: string[] = ['documentTitle', 'actions'];
  selectedCertificateVsId!: string;
  viewTemplate$: Subject<void> = new Subject<void>();
  certifyTrainees$: Subject<void> = new Subject<void>();
  private destroy$: Subject<void> = new Subject();

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<number>,
              public lang: LangService,
              public service: TraineeService,
              private dialogService: DialogService,
              private toast: ToastService,
              private certificateService: CertificateService,
              private dialogRef: DialogRef) {
    this.trainingProgramId = data.model;
    this.models = data.list;
  }

  ngOnInit(): void {
    this.listenToViewTemplate();
    this.listenToCertifyTrainees();
  }

  listenToViewTemplate() {
    this.viewTemplate$.pipe(
      takeUntil(this.destroy$),
      switchMap(() => {
        return this.models.find(x => x.vsId == this.selectedCertificateVsId)!.viewTemplate();
      })
    ).subscribe();
  }

  viewTemplate(vsId: string) {
    let sub:any = this.models.find(x => x.vsId == vsId)!.viewTemplate()
      .pipe(takeUntil(this.destroy$)).subscribe(() => sub.unsubscribe());
  }

  listenToCertifyTrainees() {
    this.certifyTrainees$.pipe(
      takeUntil(this.destroy$),
      switchMap(() => {
        return this.certificateService.createCertificatesForTrainingProgram(this.trainingProgramId, this.selectedCertificateVsId);
      })
    ).subscribe(success => {
      if(success) {
        this.toast.success(this.lang.map.certificates_has_been_created_successfully);
        this.dialogRef.close(UserClickOn.YES);
      }
    });
  }

  get popupTitle(): string {
    return this.lang.map.certificates_templates;
  };

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
