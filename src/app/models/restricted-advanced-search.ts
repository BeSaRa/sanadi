import { IMyDateModel } from '@nodro7/angular-mydatepicker';
import { Cloneable } from "./cloneable";
import { WorldCheckSearchResult } from "./world-check-search-result";
import { BannedPerson } from "./banned-person";
import { BannedPersonTerrorism } from "./BannedPersonTerrorism";
import { DateUtils } from "@app/helpers/date-utils";
import { LookupService } from "@app/services/lookup.service";
import { FactoryService } from "@app/services/factory.service";

export class RestrictedAdvancedSearchResult extends Cloneable<RestrictedAdvancedSearchResult> {
  id!: number;
  creationDate!: string | IMyDateModel;
  entityType!: string;
  name!: string;
  results: RestrictedAdvancedSearchItemResult[] = [];

   MapFromWorldCheckResult(result: WorldCheckSearchResult ) {
    return result.results.map(item => new RestrictedAdvancedSearchItemResult().clone({
      dateOfBirth: RestrictedAdvancedSearchResult.getBirthDays(item.events),
      gender: item.gender,
      source: "World Check",
      primaryName: item.primaryName
    }))
  
  }
  static getBirthDays(events: any): string {
    const birth = events?.filter((e: any) => e.type == 'BIRTH') ?? [];
    return birth.reduce((curr: any, next: any) => {
      return (curr ? curr + ' / ' : '') + next.fullDate
    }, '');
  }
}
export class RestrictedAdvancedSearchItemResult extends Cloneable<RestrictedAdvancedSearchItemResult> {

  primaryName!: string;
  gender!: string;
  source!: 'World Check' | 'Commission' | 'MOI';
  dateOfBirth!: string ;
  lookup!:LookupService
  
  constructor( ){
    super();
    this.lookup = FactoryService.getService('LookupService')
  }
   getGender(lookupKey:number){
    return this.lookup.listByCategory.Gender.find(item=>item.lookupKey === lookupKey)?.getName()??''
  }
   MapFromBannedPerson(bannedPerson: BannedPerson) {
    return new RestrictedAdvancedSearchItemResult().clone({
      primaryName: bannedPerson.name,
      gender: this.getGender(bannedPerson.gender),
      source: 'Commission',
      dateOfBirth: DateUtils.changeDateFromDatepicker(bannedPerson.dateOfBirth as IMyDateModel)?.toLocaleDateString('en')
    })
  }
   MapFromBannedPersonTerrorism(bannedPerson: BannedPersonTerrorism) {
    return new RestrictedAdvancedSearchItemResult().clone({
      primaryName: bannedPerson.name,
      gender: bannedPerson.sex,
      source: 'MOI',
      dateOfBirth: DateUtils.changeDateFromDatepicker(bannedPerson.dateOfBirth as IMyDateModel)?.toLocaleDateString('en')
    })
  }
}