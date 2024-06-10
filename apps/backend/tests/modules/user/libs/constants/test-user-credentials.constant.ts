import { faker } from '@faker-js/faker';

import { type UserSignUpRequestDto } from '~/packages/auth/auth.js';
import { UserPayloadKey } from '~/packages/user/user.js';

const USERS_COUNT = 2;

const TEST_USERS_CREDENTIALS = Array.from(
  { length: USERS_COUNT },
  (): UserSignUpRequestDto => {
    return {
      [UserPayloadKey.EMAIL]: faker.internet.email(),
      [UserPayloadKey.PASSWORD]: faker.internet.password(),
      [UserPayloadKey.USERNAME]: faker.person.firstName()
    };
  }
);

export { TEST_USERS_CREDENTIALS };