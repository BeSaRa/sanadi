import { IMyDateModel } from "angular-mydatepicker";

export class BannedPersonTerrorism {
    registrationNo!: string;
    nationality!: string;
    name!: string;
    gender!: string;
    documentNumber!: string;
    documentType!: string;
    requestFullSerial!: string;
    legalNature!: string;
    documentDetails!: string;
    createdOn!:string;
    fileName!:  string;
    dateOfBirth!:   string |IMyDateModel;
    sex!:string;

   

}

export type BannedPersonTerrorismFile={
    fileName: string;
    fileSize:string;
    itemCount:number;
    requestFullSerial:string;
}