import { Cloneable } from './cloneable';

export class ProfileDetails extends Cloneable<ProfileDetails> {
  arName!: string;
  enName!: string;
  profileId!: number;
  entityId!: number;
}
