import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { DomainTypes } from '@app/enums/domain-types';
import { AdminLookup } from '@app/models/admin-lookup';
import { AdminResult } from '@app/models/admin-result';
import { Lookup } from '@app/models/lookup';
import { TransferFundsCharityPurpose } from '@app/models/transfer-funds-charity-purpose';
import { DacOchaService } from '@app/services/dac-ocha.service';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
  selector: 'app-TIFA-purpose-popup',
  templateUrl: './TIFA-purpose-popup.component.html',
  styleUrls: ['./TIFA-purpose-popup.component.scss']
})
export class TIFAPurposePopupComponent implements OnInit {
  form: UntypedFormGroup;
  readonly: boolean;
  editItem: number;
  model: TransferFundsCharityPurpose;
  projectTypes: Lookup[] = [];
  countries: Lookup[] = [];
  domains: Lookup[] = [];
  mainOchas: AdminLookup[] = [];
  mainDacs: AdminLookup[] = [];
  isHumanitarian = true;
  isDevelopment = true;
  constructor(@Inject(DIALOG_DATA_TOKEN)
  public data: {
    form: UntypedFormGroup,
    readonly: boolean,
    editItem: number,
    model: TransferFundsCharityPurpose,
    projectTypes: Lookup[],
    countries: Lookup[],
    domains: Lookup[]
  },
    private dacOchaService: DacOchaService,
    public lang: LangService,
    private dialogRef: DialogRef) {
    this.form = data.form;
    this.readonly = data.readonly;
    this.editItem = data.editItem;
    this.model = data.model;
    this.projectTypes = data.projectTypes;
    this.countries = data.countries;
    this.domains = data.domains;
  }

  ngOnInit() {
    const row = { ...this.model };
    this.listenToDomainChanges();
    this.form.patchValue(row);
  }

  listenToDomainChanges() {
    this.domain.valueChanges.subscribe(val => {
      if (val === DomainTypes.HUMANITARIAN) {
        this.showAndRequireMainUNOCHACategory();
        this.hideAndDontRequireMainDACCategory();
        this.loadOchas();
      } else if (val === DomainTypes.DEVELOPMENT) {
        this.hideAndDontRequireMainUNOCHACategory();
        this.showAndRequireMainDACCategory();
        this.loadDacs();
      } else {
        this.showAndDontRequireMainUNOCHACategory();
        this.showAndDontRequireMainDACCategory();
      }
    });
  }

  showAndDontRequireMainUNOCHACategory() {
    this.mainUNOCHACategory.setValidators([]);
    this.mainUNOCHACategory.updateValueAndValidity();
    this.isHumanitarian = true;
  }
  showAndDontRequireMainDACCategory() {
    this.mainDACCategory.setValidators([]);
    this.mainDACCategory.updateValueAndValidity();
    this.isDevelopment = true;
  }

  loadOchas() {
    this.dacOchaService.loadByType(AdminLookupTypeEnum.OCHA).subscribe(list => {
      this.mainOchas = list;
    });
  }
  showAndRequireMainUNOCHACategory() {
    this.mainUNOCHACategory.setValidators([CustomValidators.required]);
    this.mainUNOCHACategory.updateValueAndValidity();
    this.isHumanitarian = true;
  }
  hideAndDontRequireMainDACCategory() {
    this.mainDACCategory.patchValue(null);
    this.mainDACCategory.setValidators([]);
    this.mainDACCategory.updateValueAndValidity();
    this.isDevelopment = false;
  }

  loadDacs() {
    this.dacOchaService.loadByType(AdminLookupTypeEnum.DAC).subscribe(list => {
      this.mainDacs = list;
    });
  }
  hideAndDontRequireMainUNOCHACategory() {
    this.mainUNOCHACategory.patchValue(null);
    this.mainUNOCHACategory.setValidators([]);
    this.mainUNOCHACategory.updateValueAndValidity();
    this.isHumanitarian = false;
  }
  showAndRequireMainDACCategory() {
    this.mainDACCategory.setValidators([CustomValidators.required]);
    this.mainDACCategory.updateValueAndValidity();
    this.isDevelopment = true;
  }

  get domain(): UntypedFormControl {
    return this.form.get('domain')! as UntypedFormControl;
  }
  get mainDACCategory(): UntypedFormControl {
    return this.form.get('mainDACCategory')! as UntypedFormControl;
  }

  get mainUNOCHACategory(): UntypedFormControl {
    return this.form.get('mainUNOCHACategory')! as UntypedFormControl;
  }
  mapFormTo(form: any): TransferFundsCharityPurpose {
    const purpose: TransferFundsCharityPurpose = new TransferFundsCharityPurpose().clone(form);
    purpose.projectTypeInfo = AdminResult.createInstance(this.projectTypes.find(x => x.lookupKey == purpose.projectType)!);
    purpose.domainInfo = AdminResult.createInstance(this.domains.find(x => x.lookupKey == purpose.domain)!);
    purpose.mainUNOCHACategoryInfo = AdminResult.createInstance(this.mainOchas.find(x => x.id == purpose.mainUNOCHACategory)!);
    purpose.mainDACCategoryInfo = AdminResult.createInstance(this.mainDacs.find(x => x.id == purpose.mainDACCategory)!);
    purpose.beneficiaryCountryInfo = AdminResult.createInstance(this.countries.find(x => x.id == purpose.beneficiaryCountry)!);
    purpose.executionCountryInfo = AdminResult.createInstance(this.countries.find(x => x.id == purpose.executionCountry)!);

    return purpose;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }

}
