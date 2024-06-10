const ControllerHook = {
  HANDLER: 'handler',
  ON_ERROR: 'onError',
  ON_REQUEST: 'onRequest',
  ON_RESPONSE: 'onResponse',
  ON_SEND: 'onSend',
  ON_TIMEOUT: 'onTimeout',
  PRE_HANDLER: 'preHandler',
  PRE_PARSING: 'preParsing',
  PRE_SERIALIZATION: 'preSerialization',
  PRE_VALIDATION: 'preValidation'
} as const;

export { ControllerHook };
