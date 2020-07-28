import {
  ISimplifiedFormQuestion,
  ISimplifiedFormSection,
  ISimplifiedForm,
} from './form-types';
import {
  extractPathsFromFormVersions,
  v4,
  extractLeafUuid,
  extractFlattenedResponsesFromSubmission,
  aggregateResponsesByQuestionId,
  makeFormAggregateResponses,
  makeAllSectionsAggregateResponses,
} from './id-utils';
import {
  FORM_VERSIONS,
  ALL_SUBMISSIONS,
  UPDATED_FORM,
  ORIGINAL_FORM,
} from './form-states';

const matchRegex = (input: string) => {
  const pattern = /^[a-zA-Z\d]{8}-[a-zA-Z\d]{4}-[a-zA-Z\d]{4}-[a-zA-Z\d]{4}-[a-zA-Z\d]{12}/;
  return pattern.test(input);
};

// construct all paths from all versions of forms
// const allFormPaths = extractPathsFromFormVersions(FORM_VERSIONS);

// extract paths from latest version of form
const latestQuestionPaths = extractPathsFromFormVersions([UPDATED_FORM]);

console.log('-- Form key paths: ', latestQuestionPaths);

// get question IDs from latest form version
const latestQuestionIds = Array.from(latestQuestionPaths).map((x) => {
  return extractLeafUuid(x);
});
console.log('--- question IDs: ', latestQuestionIds);

// extract flattened responses, by question ID
/*
const singleResponse = extractFlattenedResponsesFromSubmission(
  ALL_SUBMISSIONS[0]
);
console.log(
  '--- Single response (submitted for version 1 of the form): ',
  singleResponse
);
*/

// extract responses keyed by question ID
const responsesByQuestionID = aggregateResponsesByQuestionId(ALL_SUBMISSIONS);
// console.log('--- Responses keyed by question ID: ', responsesByQuestionID);

// aggregate responses with respect to the latest version of the form:
const latestAggregateResponses = makeFormAggregateResponses(
  ORIGINAL_FORM,
  responsesByQuestionID
);
console.log('~~~~~~~~~~~~~~~~~~');
console.log(
  '--- Responses in context of REVISED form structure: ',
  latestAggregateResponses
);

// aggregate responses with respect to the original version of the form:
const originalAggregateResponses = makeFormAggregateResponses(
  UPDATED_FORM,
  responsesByQuestionID
);

console.log('~~~~~~~~~~~~~~~~~~');
console.log(
  '--- Responses in context of ORIGINAL form structure: ',
  originalAggregateResponses
);
