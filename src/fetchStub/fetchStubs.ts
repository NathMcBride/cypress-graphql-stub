/* eslint-disable no-console */
/// <reference types="Cypress" />
import { Matcher, gqlMatcher } from '../matchers';
import { requestInitBodyIsString, requestInfoIsString } from '../util';

type Operation = {
  matches: (input: string, init?: RequestInit) => boolean;
  respond: (input: string, init?: RequestInit) => Promise<unknown>;
};

export type JSONPrimitive = string | number | boolean | null;
// eslint-disable-next-line no-use-before-define
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export type JSONObject = { [member: string]: JSONValue };
export type JSONArray = JSONValue[];

export type Call = {
  url: string;
  method: string;
  body: JSONObject;
};

function restRespond({ status, body }: { status: number; body: object }) {
  return new Promise(resolve => {
    setTimeout(
      () =>
        resolve({
          ok: status === 200,
          status,
          json() {
            return Promise.resolve(body);
          },
          text() {
            return Promise.resolve(JSON.stringify(body));
          },
          clone() {
            return {
              arrayBuffer() {
                return {
                  then() {
                    return {
                      byteLength: 10
                    };
                  }
                };
              }
            };
          }
        }),
      100
    );
  });
}

class FetchStubs {
  private ops: Operation[] = [];

  private signals: { [token: string]: () => void } = {};

  private calls: Call[] = [];

  public add(op: Operation) {
    // ordering is important, new op should be found first
    this.ops = [op, ...this.ops];
  }

  public scheduleOnSignal(token: string, task: () => void) {
    console.log(`Scheduling task on signal ${token}`);
    this.signals[token] = task;
  }

  public sendSignal(token: string) {
    const waiter = this.signals[token];
    if (waiter) {
      console.log(`Signal ${token} sent`);
      delete this.signals[token];
      waiter();
    } else {
      console.log(`Invalid signal ${token} sent`);
    }
  }

  public addError({
    path,
    method,
    error
  }: {
    path: string;
    method: string;
    error: Error;
  }) {
    cy.log(`Adding error stub for ${method} request to ${path}`);
    this.add({
      matches(url, request) {
        const urlMatches = url === path;
        const requestMethod = request?.method?.toUpperCase() ?? 'GET';
        const methodMatches = requestMethod === method.toUpperCase();
        if (!urlMatches) {
          console.log(
            `Not using stub for ${method} request to ${path} because ${url} does not match`
          );
        }
        if (!methodMatches) {
          console.log(
            `Not using stub for ${method} request to ${path} because ${requestMethod} does not match`
          );
        }
        return urlMatches && methodMatches;
      },
      respond: () => Promise.reject(error)
    });
  }

  public addGraphQl<T>({
    operationName,
    data,
    errors,
    token,
    matcher
  }: {
    operationName: string;
    data?: T;
    errors?: unknown[];
    token?: string;
    matcher?: Matcher;
  }) {
    cy.log(`Adding stub for ${operationName}`);
    const body = { data, errors };

    const respond = token
      ? () =>
          new Promise(resolve => {
            console.log(
              `Responding to ${operationName} with ${JSON.stringify(
                body
              )} when signalled with "${token}"`
            );
            this.scheduleOnSignal(token, () => {
              const response = restRespond({ status: 200, body });
              resolve(response);
            });
          })
      : () => {
          console.log(
            `Responding to ${operationName} with ${JSON.stringify(body)}`
          );
          const response = restRespond({ status: 200, body });
          return response;
        };

    this.add({
      matches: matcher !== undefined ? matcher : gqlMatcher(operationName),
      respond
    });
  }

  public addRest<T>({
    path,
    method,
    status,
    body,
    token
  }: {
    path: string;
    method: string;
    status: number;
    body: T;
    token?: string;
  }) {
    cy.log(`Adding stub for ${method} request to ${path}:${status}`);

    const response = restRespond({ status, body: body as unknown as object });

    const respond = token
      ? () =>
          new Promise(resolve => {
            console.log(
              `Responding to ${method}:${path} with ${status} when signalled with "${token}"`
            );
            this.scheduleOnSignal(token, () => resolve(response));
          })
      : () => {
          console.log(`Responding to ${method}:${path} with ${status}`);
          return response;
        };

    this.add({
      matches(url, request) {
        const urlMatches = url === path;
        const methodMatches = (request?.method ?? 'GET') === method;
        return urlMatches && methodMatches;
      },
      respond
    });
  }

  public apply(win: typeof window) {
    cy.stub(win, 'fetch', (...args: [RequestInfo, RequestInit?]) => {
      const [url, request] = args;
      if (!requestInfoIsString(url)) {
        console.log(
          `Bypassing stubs for ${
            request?.method ?? 'GET'
          } request to ${JSON.stringify(url)} because the url is not a string.`
        );
        return fetch(...args);
      }
      if (request) {
        const call: Call = {
          url,
          method: request.method ?? 'GET',
          body:
            request?.body && requestInitBodyIsString(request?.body)
              ? (JSON.parse(request.body) as JSONObject)
              : {}
        };
        this.calls = [...this.calls, call];
        console.log(`Recording ${JSON.stringify(call)}`);
      }
      const response = this.ops
        .find(op => op.matches(url, request))
        ?.respond(url, request);
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      if (!response) {
        console.log(
          `Bypassing stubs for ${request?.method ?? 'GET'} request to ${url}`
        );
        return fetch(...args);
      }
      return response;
    });
  }

  public getCalls() {
    return this.calls;
  }
}

export default FetchStubs;
