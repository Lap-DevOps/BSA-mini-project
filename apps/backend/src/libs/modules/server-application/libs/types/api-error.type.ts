import { type FastifyError } from 'fastify';
import { ValidationError } from '~/libs/exceptions/exceptions.js';

type APIError = FastifyError | ValidationError;

export { type APIError };
