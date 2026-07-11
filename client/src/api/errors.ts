export function getErrorMessage(err: any, fallback: string): string {
  const data = err?.response?.data;
  if (data?.error) return data.error;
  if (data?.message) return data.message;
  if (data?.errors?.length > 0) return data.errors.map((e: any) => e.message).join('; ');
  return fallback;
}
