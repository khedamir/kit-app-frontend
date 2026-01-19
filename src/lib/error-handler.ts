/**
 * Утилита для обработки ошибок
 * В production режиме ошибки логируются, но не выводятся в консоль
 */

interface ErrorInfo {
  message: string;
  code?: string;
  status?: number;
}

export function handleError(error: unknown, context?: string): ErrorInfo {
  let errorInfo: ErrorInfo = {
    message: "Произошла ошибка. Пожалуйста, попробуйте позже.",
  };

  if (error instanceof Error) {
    errorInfo.message = error.message;
  } else if (typeof error === "string") {
    errorInfo.message = error;
  } else if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    errorInfo.message = error.message;
  }

  // Логирование только в development
  if (import.meta.env.DEV) {
    const logContext = context ? `[${context}]` : "";
    // eslint-disable-next-line no-console
    console.error(`${logContext} Error:`, error);
  }

  return errorInfo;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "Произошла неизвестная ошибка";
}
