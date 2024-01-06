import { requestInitBodyIsString } from '../util';
import { Matcher } from './Matcher';

export const gqlMatcher = (operationName: string): Matcher => {
  return (url, request): boolean => {
    if (
      url.indexOf('graphql') !== -1 &&
      request &&
      requestInitBodyIsString(request?.body)
    ) {
      const postBody = JSON.parse(request.body);
      return postBody.operationName === operationName;
    }
    return false;
  };
};
