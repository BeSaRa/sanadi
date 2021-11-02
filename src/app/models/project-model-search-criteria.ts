import {ProjectModel} from "@app/models/project-model";

export class ProjectModelSearchCriteria extends ProjectModel {
  assignDateFrom?: string;
  assignDateTo?: string;
  createdOnFrom?: string | Date;
  createdOnTo?: string | Date;
  lastModifiedFrom?: string;
  lastModifiedTo?: string;
  limit?: number;
}
