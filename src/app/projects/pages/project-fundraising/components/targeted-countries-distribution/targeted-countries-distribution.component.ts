import {Component, Input, OnInit} from '@angular/core';
import {ProjectFundraising} from "@app/models/project-fundraising";
import {ProjectFundraisingService} from "@services/project-fundraising.service";
import {Country} from "@app/models/country";
import {OperationTypes} from "@app/enums/operation-types.enum";

@Component({
  selector: 'targeted-countries-distribution',
  templateUrl: './targeted-countries-distribution.component.html',
  styleUrls: ['./targeted-countries-distribution.component.scss']
})
export class TargetedCountriesDistributionComponent implements OnInit {
  @Input()
  model!: ProjectFundraising
  @Input()
  countries: Country[] = []
  @Input()
  operation!: OperationTypes
  @Input()
  readonly: boolean = false;


  constructor(private service: ProjectFundraisingService) {
  }

  ngOnInit(): void {

  }
}
