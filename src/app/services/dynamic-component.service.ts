import {ComponentType} from '@angular/cdk/overlay';

export class DynamicComponentService {
  static components: Map<string, ComponentType<any>> = new Map<string, ComponentType<any>>();

  constructor(callback: () => void) {
    callback();
  }

  static getComponent(name: string): ComponentType<any> {
    return DynamicComponentService.components.get(name)!;
  }

  static registerComponent(name: string, component: ComponentType<any>): void {
    DynamicComponentService.components.set(name, component);
  }
}
