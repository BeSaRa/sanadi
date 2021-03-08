import {Component, OnInit} from '@angular/core';
import {ConfigurationService} from '../../../services/configuration.service';

@Component({
  selector: 'app-version',
  templateUrl: './version.component.html',
  styleUrls: ['./version.component.scss']
})
export class VersionComponent implements OnInit {

  constructor(public config: ConfigurationService) {
  }

  ngOnInit(): void {
  }

}
