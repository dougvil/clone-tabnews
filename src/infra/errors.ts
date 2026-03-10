class BaseError extends Error {
  action: string;
  statusCode: number;

  constructor(options: { message?: string; cause?: unknown }) {
    super(options.message || 'Unexpected Error', { cause: options.cause });
    this.name = 'InternalServerError';
    this.action =
      'Support has been notified of the issue and is working on a fix.';
    this.statusCode = 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class InternalServerError extends BaseError {
  constructor(options: { cause?: unknown; message?: string; action?: string }) {
    super({ cause: options.cause });
    this.name = 'InternalServerError';
    this.statusCode = 500;
  }
}

export class BadRequestError extends BaseError {
  constructor(options: { cause?: unknown; message?: string; action?: string }) {
    super({ cause: options.cause });
    this.name = 'BadRequestError';
    this.action = options.action ?? 'Check the submitted data and try again.';
    this.statusCode = 400;
  }
}

export class UnauthorizedError extends BaseError {
  constructor(options: { cause?: unknown; message?: string; action?: string }) {
    super({ cause: options.cause });
    this.name = 'UnauthorizedError';
    this.action =
      options.action ?? 'Make sure you are authenticated and try again.';
    this.statusCode = 401;
  }
}

export class ForbiddenError extends BaseError {
  constructor(options: { cause?: unknown; message?: string; action?: string }) {
    super({ cause: options.cause });
    this.name = 'ForbiddenError';
    this.action =
      options.action ??
      'Make sure you have the required permissions to perform this action.';
    this.statusCode = 403;
  }
}

export class NotFoundError extends BaseError {
  constructor(options: { cause?: unknown; message?: string; action?: string }) {
    super({ message: options.message, cause: options.cause });
    this.name = 'NotFoundError';
    this.action =
      options.action ||
      'Check if the requested resource URL is correct and try again.';
    this.statusCode = 404;
  }
}

export class TooManyRequestsError extends BaseError {
  constructor(options: { cause?: unknown; message?: string; action?: string }) {
    super({ cause: options.cause, message: options.message });
    this.name = 'TooManyRequestsError';
    this.action = options.action ?? 'Wait a few moments before trying again.';
    this.statusCode = 429;
  }
}

export class ServiceError extends BaseError {
  action: string;
  statusCode: number;

  constructor(options: { cause?: unknown; message?: string; action?: string }) {
    super({ message: options.message, cause: options.cause });
    this.name = 'ServiceError';
    this.action =
      options.action ??
      'Support has been notified of the issue and is working on a fix.';
    this.statusCode = 503;
  }
}

export class ValidationError extends BaseError {
  constructor(options: { cause?: unknown; message?: string; action?: string }) {
    super({ message: options.message, cause: options.cause });
    this.name = 'ValidationError';
    this.action = options.action ?? 'Check the submitted data and try again.';
    this.statusCode = 400;
  }
}
