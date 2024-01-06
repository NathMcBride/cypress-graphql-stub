export function requestInitBodyIsString(
  body: RequestInit['body']
): body is string {
  return (body as string).length !== undefined;
}

export function requestInfoIsString(input: RequestInfo): input is string {
  return (input as string).length !== undefined;
}

export const keysAsRegExp = (arg: unknown) => {
  if (typeof arg === 'object') {
    return new RegExp(Object.keys(arg).join('|'));
  }

  return null;
};
