export class InternalServerError extends Error {
  action: string;
  statusCode: number;

  constructor(options: { cause?: unknown }) {
    super('Unexpected Error', { cause: options.cause });
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
      statusCode: this.statusCode,
    };
  }
}

export class BadRequestError extends Error {
  action: string;
  statusCode: number;

  constructor(options: { cause?: unknown; message?: string; action?: string }) {
    super(options.message || 'Invalid request.', { cause: options.cause });
    this.name = 'BadRequestError';
    this.action = options.action || 'Check the submitted data and try again.';
    this.statusCode = 400;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      statusCode: this.statusCode,
    };
  }
}

export class UnauthorizedError extends Error {
  action: string;
  statusCode: number;

  constructor(options: { cause?: unknown; message?: string; action?: string }) {
    super(options.message || 'Not authenticated.', { cause: options.cause });
    this.name = 'UnauthorizedError';
    this.action =
      options.action || 'Make sure you are authenticated and try again.';
    this.statusCode = 401;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      statusCode: this.statusCode,
    };
  }
}

export class ForbiddenError extends Error {
  action: string;
  statusCode: number;

  constructor(options: { cause?: unknown; message?: string; action?: string }) {
    super(options.message || 'Access denied.', { cause: options.cause });
    this.name = 'ForbiddenError';
    this.action =
      options.action ||
      'Make sure you have the required permissions to perform this action.';
    this.statusCode = 403;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      statusCode: this.statusCode,
    };
  }
}

export class NotFoundError extends Error {
  action: string;
  statusCode: number;

  constructor(options: { cause?: unknown; message?: string; action?: string }) {
    super(options.message || 'Resource not found.', { cause: options.cause });
    this.name = 'NotFoundError';
    this.action =
      options.action ||
      'Check if the requested resource URL is correct and try again.';
    this.statusCode = 404;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      statusCode: this.statusCode,
    };
  }
}

export class TooManyRequestsError extends Error {
  action: string;
  statusCode: number;

  constructor(options: { cause?: unknown; message?: string; action?: string }) {
    super(options.message || 'Too many requests.', { cause: options.cause });
    this.name = 'TooManyRequestsError';
    this.action = options.action || 'Wait a few moments before trying again.';
    this.statusCode = 429;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      statusCode: this.statusCode,
    };
  }
}
