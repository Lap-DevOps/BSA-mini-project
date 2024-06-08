import { faker } from '@faker-js/faker';
import { describe, expect, it } from '@jest/globals';

import { APIPath } from '~/libs/enums/enums.js';
import { config } from '~/libs/modules/config/config.js';
import { DatabaseTableName } from '~/libs/modules/database/database.js';
import { HTTPCode, HTTPMethod } from '~/libs/modules/http/http.js';
import { joinPath } from '~/libs/modules/path/path.js';
import {
  AuthApiPath,
  type UserRegisterRequestDto,
  type UserRegisterResponseDto
} from '~/packages/auth/auth.js';
import {
  UserPayloadKey,
  UserValidationMessage,
  UserValidationRule
} from '~/packages/user/user.js';

import { buildApp } from '../../libs/modules/app/app.js';
import {
  getCrudHandlers,
  KNEX_SELECT_ONE_RECORD
} from '../../libs/modules/database/database.js';
import { TEST_USERS_CREDENTIALS } from '../user/user.js';
import { API_V1_VERSION_PREFIX } from '../../libs/constants/constants.js';

const authApiPath = joinPath([config.ENV.APP.API_PATH, APIPath.AUTH]);

const registerEndpoint = joinPath([
  config.ENV.APP.API_PATH,
  API_V1_VERSION_PREFIX,
  APIPath.AUTH,
  AuthApiPath.REGISTER
]);

describe(`${authApiPath} routes`, () => {
  const { getApp, getKnex } = buildApp();
  const { select } = getCrudHandlers(getKnex);

  describe(`${registerEndpoint} (${HTTPMethod.POST}) endpoint`, () => {
    const app = getApp();

    it(`should return ${HTTPCode.UNPROCESSED_ENTITY} of empty ${UserPayloadKey.USERNAME} validation error`, async () => {
      const response = await app.inject().post(registerEndpoint).body({});
      console.log('response', response);
      expect(response.statusCode).toBe(HTTPCode.UNPROCESSED_ENTITY);
      expect(response.json<Record<'message', string>>().message).toBe(
        `${UserValidationMessage.USERNAME_REQUIRE}. ${UserValidationMessage.EMAIL_REQUIRE}. ${UserValidationMessage.PASSWORD_REQUIRE}`
      );
    });

    it(`should return ${HTTPCode.UNPROCESSED_ENTITY} of too short ${UserPayloadKey.USERNAME} validation error`, async () => {
      const [validTestUser] = TEST_USERS_CREDENTIALS;

      const response = await app
        .inject()
        .post(registerEndpoint)
        .body({
          ...validTestUser,
          [UserPayloadKey.USERNAME]: faker.string.alpha(
            UserValidationRule.USERNAME_MIN_LENGTH - 1
          )
        });

      expect(response.statusCode).toBe(HTTPCode.UNPROCESSED_ENTITY);
      expect(response.json<Record<'message', string>>().message).toBe(
        UserValidationMessage.USERNAME_MIN_LENGTH
      );
    });

    it(`should return ${HTTPCode.UNPROCESSED_ENTITY} of too long ${UserPayloadKey.USERNAME} validation error`, async () => {
      const [validTestUser] = TEST_USERS_CREDENTIALS;

      const response = await app
        .inject()
        .post(registerEndpoint)
        .body({
          ...validTestUser,
          [UserPayloadKey.USERNAME]: faker.string.alpha(
            UserValidationRule.USERNAME_MAX_LENGTH + 2
          )
        });

      expect(response.statusCode).toBe(HTTPCode.UNPROCESSED_ENTITY);
      expect(response.json<Record<'message', string>>().message).toBe(
        UserValidationMessage.USERNAME_MAX_LENGTH
      );
    });

    it(`should return ${HTTPCode.UNPROCESSED_ENTITY} of empty ${UserPayloadKey.EMAIL} validation error`, async () => {
      const [validTestUser] = TEST_USERS_CREDENTIALS;
      const { [UserPayloadKey.EMAIL]: _email, ...user } =
        validTestUser as UserRegisterRequestDto;

      const response = await app.inject().post(registerEndpoint).body(user);

      expect(response.statusCode).toBe(HTTPCode.UNPROCESSED_ENTITY);
      expect(response.json<Record<'message', string>>().message).toBe(
        UserValidationMessage.EMAIL_REQUIRE
      );
    });

    it(`should return ${HTTPCode.UNPROCESSED_ENTITY} of wrong ${UserPayloadKey.EMAIL} validation error`, async () => {
      const [validTestUser] = TEST_USERS_CREDENTIALS;

      const response = await app
        .inject()
        .post(registerEndpoint)
        .body({
          ...validTestUser,
          [UserPayloadKey.EMAIL]: faker.person.firstName()
        });

      expect(response.statusCode).toBe(HTTPCode.UNPROCESSED_ENTITY);
      expect(response.json<Record<'message', string>>().message).toBe(
        UserValidationMessage.EMAIL_WRONG
      );
    });

    it(`should return ${HTTPCode.UNPROCESSED_ENTITY} of empty ${UserPayloadKey.PASSWORD} validation error`, async () => {
      const [validTestUser] = TEST_USERS_CREDENTIALS;
      const { [UserPayloadKey.PASSWORD]: _password, ...user } =
        validTestUser as UserRegisterRequestDto;

      const response = await app.inject().post(registerEndpoint).body(user);

      expect(response.statusCode).toBe(HTTPCode.UNPROCESSED_ENTITY);
      expect(response.json<Record<'message', string>>().message).toBe(
        UserValidationMessage.PASSWORD_REQUIRE
      );
    });

    it(`should return ${HTTPCode.UNPROCESSED_ENTITY} of too short ${UserPayloadKey.PASSWORD} validation error`, async () => {
      const [validTestUser] = TEST_USERS_CREDENTIALS;

      const response = await app
        .inject()
        .post(registerEndpoint)
        .body({
          ...validTestUser,
          [UserPayloadKey.PASSWORD]: faker.internet.password({
            length: UserValidationRule.PASSWORD_MIN_LENGTH - 2
          })
        });

      expect(response.statusCode).toBe(HTTPCode.UNPROCESSED_ENTITY);
      expect(response.json<Record<'message', string>>().message).toBe(
        UserValidationMessage.PASSWORD_MIN_LENGTH
      );
    });

    it(`should return ${HTTPCode.UNPROCESSED_ENTITY} of too long ${UserPayloadKey.PASSWORD} validation error`, async () => {
      const [validTestUser] = TEST_USERS_CREDENTIALS;

      const response = await app
        .inject()
        .post(registerEndpoint)
        .body({
          ...validTestUser,
          [UserPayloadKey.PASSWORD]: faker.internet.password({
            length: UserValidationRule.PASSWORD_MAX_LENGTH + 2
          })
        });

      expect(response.statusCode).toBe(HTTPCode.UNPROCESSED_ENTITY);
      expect(response.json<Record<'message', string>>().message).toBe(
        UserValidationMessage.PASSWORD_MAX_LENGTH
      );
    });

    it(`should return ${HTTPCode.CREATED} and create a new user`, async () => {
      const [validTestUser] = TEST_USERS_CREDENTIALS as [
        UserRegisterRequestDto
      ];

      const response = await app
        .inject()
        .post(registerEndpoint)
        .body(validTestUser);

      expect(response.statusCode).toBe(HTTPCode.CREATED);
      expect(response.json()).toEqual(
        expect.objectContaining({
          [UserPayloadKey.USERNAME]: validTestUser[UserPayloadKey.USERNAME],
          [UserPayloadKey.EMAIL]: validTestUser[UserPayloadKey.EMAIL]
        })
      );

      const savedDatabaseUser = await select({
        table: DatabaseTableName.USERS,
        condition: { id: response.json<UserRegisterResponseDto>().id },
        limit: KNEX_SELECT_ONE_RECORD
      });

      expect(savedDatabaseUser).toEqual(
        expect.objectContaining({
          [UserPayloadKey.USERNAME]: validTestUser[UserPayloadKey.USERNAME],
          [UserPayloadKey.EMAIL]: validTestUser[UserPayloadKey.EMAIL]
        })
      );
    });
  });
});
