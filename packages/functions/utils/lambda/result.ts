export const okResult = (body?: unknown) => ({
  statusCode: 200,
  body: JSON.stringify(body ?? {}, null, 2),
});

export const errorResult = (error: unknown) => ({
  statusCode: 500,
  body: JSON.stringify(
    {
      error: error instanceof Error ? error.message : error,
    },
    null,
    2,
  ),
});
