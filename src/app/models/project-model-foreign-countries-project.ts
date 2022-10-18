import {SearchableCloneable} from '@app/models/searchable-cloneable';

export class ProjectModelForeignCountriesProject extends SearchableCloneable<ProjectModelForeignCountriesProject> {
  objectDBId!: number;
  projectName!: string;
  notes!: string;
}
