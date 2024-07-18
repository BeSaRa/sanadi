import { Directive, inject, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { PermissionsEnum } from '@app/enums/permissions-enum';
import { EmployeeService } from '@app/services/employee.service';
@Directive({
    selector: '[hasAnyPermission]',
})
export class HasAnyPermissionDirective implements OnInit {

    @Input({ required: true }) hasAnyPermission!: PermissionsEnum[];

    employeeService = inject(EmployeeService);

    constructor(private templateRef: TemplateRef<any>, private viewContainerRef: ViewContainerRef) { }
    ngOnInit(): void {
        if(this.employeeService.hasAnyPermissions(this.hasAnyPermission)){
            this.viewContainerRef.createEmbeddedView(this.templateRef, {
            });
        }
       
    }
}