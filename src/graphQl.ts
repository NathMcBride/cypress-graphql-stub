/// <reference types="Cypress" />

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import FetchStubs, { Call } from './fetchStub/fetchStubs';
import { OperationToType } from './types';
import { Matcher } from './matchers';
import { OperationToQuery } from '../generated/graphql-operations';

const NO_LOG = { log: false };
let fetchStubs: FetchStubs | null = null;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
  namespace Cypress {
    interface Chainable<Subject> {
      resetFetchStubs(): Chainable<Subject>;
      getFetchStubs(): Chainable<FetchStubs>;
      getFetchStubCalls<T extends keyof OperationToQuery>(
        operation: T
      ): Chainable<Call[]>;
      addGraphQlFetchStub<T extends keyof OperationToQuery>({
        operation,
        data,
        errors,
        token,
        matcher
      }: {
        operation: T;
        data?: OperationToType<T>;
        errors?: unknown[];
        token?: string;
        matcher?: Matcher;
      }): Chainable<FetchStubs>;
    }
  }
}

Cypress.Commands.add(
  'addGraphQlFetchStub',
  {
    prevSubject: 'optional'
  },
  <T extends keyof OperationToQuery>(
    subject: unknown,
    {
      operation,
      data,
      errors,
      token,
      matcher
    }: {
      operation: T;
      data?: OperationToType<T>;
      errors?: unknown[];
      token?: string;
      matcher?: Matcher;
    }
  ) => {
    const gqlQuery = (() => {
      if (OperationToQuery[operation].length === 1) {
        return { [OperationToQuery[operation][0]]: data };
      }
      return data;
    })();

    if (subject instanceof FetchStubs) {
      subject.addGraphQl({
        operationName: operation,
        data: gqlQuery,
        errors,
        token,
        matcher
      });
      return cy.wrap(subject, NO_LOG);
    }

    fetchStubs?.addGraphQl({
      operationName: operation,
      data: gqlQuery,
      errors,
      token,
      matcher
    });
    return cy.wrap(fetchStubs, NO_LOG);
  }
);

Cypress.Commands.add('resetFetchStubs', () => {
  fetchStubs = new FetchStubs();
  return cy.wrap(fetchStubs, NO_LOG);
});

Cypress.Commands.add('getFetchStubs', () => {
  if (!fetchStubs) {
    fetchStubs = new FetchStubs();
  }

  return cy.wrap(fetchStubs, NO_LOG);
});

Cypress.Commands.add(
  'getFetchStubCalls',
  {
    prevSubject: true
  },
  <T extends keyof OperationToQuery>(subject: unknown, operation: T) => {
    if (subject instanceof FetchStubs) {
      return cy.wrap(
        subject
          .getCalls()
          .filter(
            call =>
              call.method.toUpperCase() === 'POST' &&
              call.url === '/graphql' &&
              call.body.operationName === operation
          )
          .map(call => call.body.variables)
      );
    }
    return cy.wrap([]);
  }
);
