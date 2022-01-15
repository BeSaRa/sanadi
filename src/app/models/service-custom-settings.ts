export class ServiceCustomSettings {
  constructor(public maxTargetAmount?: number,
              public maxElementsCount?: number,
              public activateDevelopmentField: boolean = false) {
  }
}
