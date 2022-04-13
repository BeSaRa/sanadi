import {Cloneable} from '@app/models/cloneable';

export class ServiceCustomSettings extends Cloneable<ServiceCustomSettings>{
  constructor(public maxTargetAmount?: number,
              public maxElementsCount?: number,
              public activateDevelopmentField: boolean = false) {
    super();
  }
}
