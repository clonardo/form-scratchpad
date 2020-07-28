import {
  ISimplifiedFormSection,
  ISimplifiedForm,
  ISimplifiedSubmission,
  IFlattenedTextResponse,
  SimplifiedResponseContent,
  ISimplifiedResponseCollection,
} from './form-types';

/**
 * V4 UUID
 */
export function v4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Test if the input string is a v4 UUID. Non-global regex.
 *
 * @param input Input to test
 */
export const matchUuid = (input: string): boolean => {
  const pattern = /^[a-zA-Z\d]{8}-[a-zA-Z\d]{4}-[a-zA-Z\d]{4}-[a-zA-Z\d]{4}-[a-zA-Z\d]{12}/;
  return pattern.test(input);
};

/**
 * Test if the input string is a form ID (v4 UUID) + form version (up to 4 digits). Non-global regex.
 *
 * @param input Input to test
 */
export const matchFormIdAndVersion = (input: string): boolean => {
  const pattern = /^[a-zA-Z\d]{8}-[a-zA-Z\d]{4}-[a-zA-Z\d]{4}-[a-zA-Z\d]{4}-[a-zA-Z\d]{12}\.\d{1,4}/;
  return pattern.test(input);
};

/**
 * For a concatenated set of UUIDs with a known delimiter, extract the leaf node ID.
 * If invalid, returns null.
 *
 * @param input some set of UUIDs concatenated with the delimiter- e.g., edf0e45e-a792-4854-9395-634344432ff9.24868796-5648-470a-b995-6767cd7c4153.1d3fc0cc-90a6-4cb6-8647-a6431d591d8c
 * @param delimiter optional segment delimiter- default: "."
 */
export const extractLeafUuid = (
  input: string,
  delimiter: string = '.'
): string => {
  if (input && input.length) {
    // split on separator
    const parts = input.split(delimiter);
    if (parts && parts.length) {
      return parts[parts.length - 1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

/**
 * Extract UUIDs from questions within a section
 *
 * @param sectionObject Section input
 */
const extractKeysFromSection = (
  sectionObject: ISimplifiedFormSection
): string[] => {
  if (sectionObject && sectionObject.questions) {
    // get keys for each section
    return Object.keys(sectionObject.questions);
  } else {
    return [];
  }
};

/**
 * Extract {[sectionUuid:string]: {[questionId:string]}} mappings
 *
 * @param sectionObject Section input
 */
const extractSectionPaths = (sections: {
  [uuid: string]: ISimplifiedFormSection;
}): Map<string, Set<string>> => {
  if (sections && Object.keys(sections)) {
    return Object.keys(sections).reduce((acc, iter) => {
      const questionIds = extractKeysFromSection(sections[iter]);
      return acc.set(iter, new Set(questionIds));
    }, new Map<string, Set<string>>());
  } else {
    return new Map<string, Set<string>>();
  }
};

/**
 * For a given form, create a set of all paths
 *
 * @param formObject Form state at a given version
 */
export const extractPathsFromFormObject = (
  formObject: ISimplifiedForm
): Set<string> => {
  if (formObject && formObject.sections) {
    // get paths for all sections
    const sectionPaths = extractSectionPaths(formObject.sections);
    const sectionIds = Array.from(sectionPaths.keys());
    // build paths within each section
    return sectionIds.reduce((acc, iter) => {
      // get question IDs for section
      const questionIds = Array.from(sectionPaths.get(iter));
      return questionIds.reduce((acc2, iter2) => {
        // sectionId.questionId
        return acc2.add(`${iter}.${iter2}`);
      }, acc);
    }, new Set<string>());
  } else {
    return new Set<string>();
  }
};

/**
 * Create a set of keys, like: formId.formVersion.sectionId.questionId
 *
 * @param forms Array of forms
 */
export const extractPathsFromFormVersions = (
  forms: ISimplifiedForm[]
): Set<string> => {
  return forms.reduce((acc, iter) => {
    // e.g., xxxx-xxxxx-xxxx-xxx.n
    const formVersionHash = `${iter.formId}.${iter.formVersion}`;
    const sectionAndQuestionPaths = Array.from(
      extractPathsFromFormObject(iter)
    );
    return sectionAndQuestionPaths.reduce((acc2, iter2) => {
      return acc2.add(`${formVersionHash}.${iter2}`);
    }, acc);
  }, new Set<string>());
};

/**
 * Flatten responses
 *
 * @param submission Submission object
 */
export const extractFlattenedResponsesFromSubmission = (
  submission: ISimplifiedSubmission
): IFlattenedTextResponse => {
  if (
    submission &&
    submission.questionResponses &&
    Object.keys(submission.questionResponses).length
  ) {
    // get IDs of questions that the responses map to
    const questionIds = Object.keys(submission.questionResponses);
    return questionIds.reduce((acc, iter) => {
      const responseObj = submission.questionResponses[iter];
      if (responseObj && Object.keys(responseObj)) {
        return {
          ...acc,
          ...{
            [iter]: {
              submissionId: submission.submissionId,
              responseText: submission.questionResponses[iter].responseText,
              responseId: submission.questionResponses[iter].responseId,
            },
          },
        };
      } else {
        return acc;
      }
    }, {});
  }
};

/**
 * Flatten multiple form submissions into a question ID-keyed map of responses
 *
 * @param submissions Array of submission objects
 */
export const aggregateResponsesByQuestionId = (
  submissions: ISimplifiedSubmission[]
): Map<string, Set<SimplifiedResponseContent>> => {
  return submissions.reduce((acc, iter) => {
    const responsesByQuestion = extractFlattenedResponsesFromSubmission(iter);
    return Object.keys(responsesByQuestion).reduce((acc2, iter2) => {
      if (acc2.has(iter2)) {
        return acc2.set(iter2, acc2.get(iter2).add(responsesByQuestion[iter2]));
      } else {
        return acc2.set(
          iter2,
          new Set<SimplifiedResponseContent>().add(responsesByQuestion[iter2])
        );
      }
    }, acc);
  }, new Map<string, Set<SimplifiedResponseContent>>());
};

/**
 * Build aggregated responses for a section of a form
 *
 * @param formObj Form to roll up
 * @param responses Responses from all versions of a form, keyed by question ID
 */
const buildSectionResponses = (
  section: ISimplifiedFormSection,
  responses: Map<string, Set<SimplifiedResponseContent>>
) => {
  const questionIds = extractKeysFromSection(section);
  return questionIds.reduce((acc, iter) => {
    if (responses.has(iter)) {
      return acc.set(iter, responses.get(iter));
    } else {
      return acc;
    }
  }, new Map<string, Set<SimplifiedResponseContent>>());
};

/**
 * For a form, roll up all sections into a map of responses
 *
 * @param formObj Form to roll up
 * @param responses Responses from all versions of a form, keyed by question ID
 */
export const makeAllSectionsAggregateResponses = (
  formObj: ISimplifiedForm,
  responses: Map<string, Set<SimplifiedResponseContent>>
) => {
  return Object.keys(formObj.sections).reduce((acc, iter) => {
    const sectionRollup = buildSectionResponses(
      formObj.sections[iter],
      responses
    );
    // console.log('section rollup: ', sectionRollup);
    return acc.set(iter, sectionRollup);
  }, new Map<string, Map<string, Set<SimplifiedResponseContent>>>());
};

/**
 * With respect to a version of a given form, view aggregated responses. Else return null
 *
 * @param formObj Form to roll up
 * @param responses Responses from all versions of a form, keyed by question ID
 */
export const makeFormAggregateResponses = (
  formObj: ISimplifiedForm,
  responses: Map<string, Set<SimplifiedResponseContent>>
): ISimplifiedResponseCollection => {
  if (formObj && responses && responses.size) {
    const sectionResponses = makeAllSectionsAggregateResponses(
      formObj,
      responses
    );

    console.log(
      `Form v${formObj.formVersion} sectionResponses`,
      sectionResponses
    );

    return {
      formId: formObj.formId,
      formVersion: formObj.formVersion,
      sections: sectionResponses,
    };
  } else {
    return null;
  }
};
