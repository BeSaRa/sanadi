import { FactoryService } from "@app/services/factory.service";
import { JobTitleCloneService } from "@app/services/job-title-clone.service";
import { LangService } from "@app/services/lang.service";
import { searchFunctionType } from "@app/types/types";
import { AdminResult } from "./admin-result";
import { BaseModel } from "./base-model";
import { INames } from '@app/interfaces/i-names';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { CustomValidators } from "@app/validators/custom-validators";
import { JobTitleCloneInterceptor } from "@app/model-interceptors/job-title-clone-interceptor";
import { InterceptModel } from "@app/decorators/decorators/intercept-model";

const interceptor: JobTitleCloneInterceptor = new JobTitleCloneInterceptor()

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class JobTitleClone extends BaseModel<JobTitleClone, JobTitleCloneService> {
    service!: JobTitleCloneService;
    langService!:LangService;
    jobType!: number;
    isSystem!:boolean;
    status!:number;
    statusInfo!:AdminResult;
    searchFields:{[key:string]:string|searchFunctionType}={
        arName:'arName',
        enName:'enName',
        status:text=>!this.statusInfo?false:this.statusInfo.getName().toLowerCase().indexOf(text) !== -1
    }
    constructor(){
        super()
        this.langService = FactoryService.getService('LangService')
        this.service = FactoryService.getService('JobTitleCloneService')
    }
    getName(){
        return this[(this.langService.map.lang + 'Name') as keyof INames]
    }
    isRetired (){
        return Number(this.status) === CommonStatusEnum.RETIRED
    }
    isDeactivated (){
        return Number(this.status) === CommonStatusEnum.DEACTIVATED
    }
    isActivated (){
        return Number(this.status) === CommonStatusEnum.ACTIVATED
    }
    updateStatus(newStatus:CommonStatusEnum){
        return this.service.updateStatus(this.id,newStatus)
    }
    buildForm(controls?:any){
        const {arName, enName,status, jobType} = this;
        return {
            arName: controls? [arName, [
                CustomValidators.required,
                CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
                CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
                CustomValidators.pattern('AR_NUM_ONE_AR')
            ]]:arName,
            enName: controls? [enName, [
                CustomValidators.required,
                CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
                CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
                CustomValidators.pattern('ENG_NUM_ONE_ENG')
            ]]:enName,
            status:controls? [status, [CustomValidators.required]]:status,
            jobType:controls? [jobType, [CustomValidators.required]]:jobType,
        }
    }
}