export function errorMessage(error: any) {
  return {
    status: 'error',
    ...(process.env.NODE_ENV == 'development'
      ? {
          error: Object.keys(error).length == 0 ? error.message : error,
        }
      : undefined),
  };
}
