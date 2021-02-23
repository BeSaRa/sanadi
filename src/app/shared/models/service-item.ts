export class ServiceItem {
  constructor(public id: number,
              public arName: string,
              public enName: string,
              public route: string,
              public icon: string,
              public permissionKey: string | string[] = '',
              public checkAnyPermission: boolean = false
  ) {

  }
}
