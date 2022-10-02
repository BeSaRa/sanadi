import { Cloneable } from './cloneable';

export class ProfielDetails extends Cloneable<ProfielDetails> {
  arName!: string;
  enName!: string;
  profileId!: string;
  entityId!: string;
}
