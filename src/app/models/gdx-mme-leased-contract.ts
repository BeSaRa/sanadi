import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { ISearchFieldsMap } from "@app/types/types";
import { SearchableCloneable } from "./searchable-cloneable";
import { GdxMmeResponseInterceptor } from "@app/model-interceptors/gdx-mme-response-interceptor";

const gdxMmeResponseInterceptor = new GdxMmeResponseInterceptor();

@InterceptModel({
  receive: gdxMmeResponseInterceptor.receive
})
export class GdxMmeResponse extends SearchableCloneable<GdxMmeResponse>{
    certificateCode!:string;
	noAtarizationNo!:string;
	noAtarizationDate!:string;
	noAtarizationFromDate!:string;
	noAtarizationToDate!:string;
	rentPurpose!:string;
	contractSignDate!:string;
	contractFromDate!:string;
	contractToDate!:string;
	propertyDeedNo!:string;
	pinNO!:number;
	propertyType!:string;
	area!:number;
	electricityNo!:number;
	waterNo!:number;
	municipality!:string;
	zoneNo!:number;
	streetNo!:number;
	buildingNo!:number;
	floorNo!:string;
	flatNo!:string;
	addressText!:string;
	tenantType!:string;
	tenantArName!:string;
	tenantEnName!:string;
  
	//extra
	contractToDateString!:string;
	contractFromDateString!:string;
	contractSignDateString!:string;
	
  searchFields: ISearchFieldsMap<GdxMmeResponse> = {
    ...normalSearchFields([
	'propertyDeedNo',
	'propertyType',
	'municipality',
	'tenantType',
	'tenantArName',
	'tenantEnName',
	'contractSignDateString',
	'contractFromDateString',
	'contractToDateString'
    ])
  }
}
