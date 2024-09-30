import { CustomValidators } from "@app/validators/custom-validators";
import { SearchableCloneable } from "./searchable-cloneable";

export class Incident extends SearchableCloneable<Incident> {
    incidentType!: number;  
    incidentNumber!: string;
    incidentTitle!: string;
    incidentDetails!: string; 
  
    buildForm(controls = false){
      const {
        incidentType,
        incidentNumber,
        incidentTitle,
        incidentDetails,
      }=this;
      return {
        incidentType: controls ? [incidentType, [CustomValidators.required]] : incidentType,
        incidentNumber: controls ? [incidentNumber, []] : incidentNumber,
        incidentTitle: controls ? [incidentTitle, []] : incidentTitle,
        incidentDetails: controls ? [incidentDetails, []] : incidentDetails,
        
      }
    }
  
  }