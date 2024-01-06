/// <reference types="Cypress" />
import { AddNoteResponse } from "../generated/graphql";

const addNoteResponse: AddNoteResponse =  {
  __typename:"AddNoteResponse",
  success:true
}

cy.addGraphQlFetchStub({operation:'addNote', data:addNoteResponse})