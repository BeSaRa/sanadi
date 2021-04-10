import { InternalUser } from './internal-user';

describe('ApplicationUser', () => {
  it('should create an instance', () => {
    expect(new InternalUser()).toBeTruthy();
  });
});
