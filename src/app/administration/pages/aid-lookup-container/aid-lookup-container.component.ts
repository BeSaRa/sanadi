import {Component, OnInit} from '@angular/core';
import {AidTypes} from '../../../enums/aid-types.enum';

@Component({
  selector: 'app-aid-lookup-container',
  templateUrl: './aid-lookup-container.component.html',
  styleUrls: ['./aid-lookup-container.component.scss']
})
export class AidLookupContainerComponent implements OnInit {
  AidTypes = AidTypes;

  constructor() {
  }

  ngOnInit(): void {
  }

}
