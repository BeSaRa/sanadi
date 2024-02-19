import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { GdxMoiPersonalInterceptor } from "@app/model-interceptors/gdx-moi-personal-interceptor";
import { ISearchFieldsMap } from "@app/types/types";
import { SearchableCloneable } from "./searchable-cloneable";
import { IMyDateModel } from "angular-mydatepicker";

const {receive} = new GdxMoiPersonalInterceptor();
@InterceptModel({
  receive: receive
})
export class GdxMoiPersonal extends SearchableCloneable<GdxMoiPersonal>{

  arbName1!: string;
  arbName2!: string;
  arbName3!: string;
  arbName4!: string;
  arbName5!: string;
  birthDateStr!: string;
  engName1!: string;
  engName2!: string;
  engName3!: string;
  engName4!: string;
  engName5!: string;
  idCardExpiryDate!: string;
  natCodeTextAR!: string;
  natCodeTextEN!: string;
  qidNum!: string;
  sex!: string;
  secretKey!: string;
  birthDate!:IMyDateModel

  searchFields: ISearchFieldsMap<GdxMoiPersonal> = {
    ...normalSearchFields(['arbName1', 'arbName2', 'arbName3', 'arbName4', 'arbName5',
      'birthDateStr', 'engName1', 'engName2', 'engName3', 'engName4', 'engName5',
      'idCardExpiryDate', 'natCodeTextAR', 'natCodeTextEN', 'qidNum', 'sex', 'secretKey'])
  }

  get arabicName (){
    return `${this.arbName1} ${this.arbName2} ${this.arbName3} ${this.arbName4} ${this.arbName5}`
  }
  get englishName (){
    return `${this.engName1} ${this.engName2} ${this.engName3} ${this.engName4} ${this.engName5}`
  }
}