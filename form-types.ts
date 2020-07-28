/**
 * Individual question
 */
export interface ISimplifiedFormQuestion {
  prompt: string;
  questionType: string;
}

/**
 * Individual section (page)
 */
export interface ISimplifiedFormSection {
  componentType: 'page';
  /**
   * Questions, keyed by question UUID
   */
  questions: {
    [uuid: string]: ISimplifiedFormQuestion;
  };
}

/**
 * Base for a form ID
 */
export interface ISimplifiedFormIdBase {
  formId: string;
  formVersion: number;
}

/**
 * Individual form, with version
 */
export interface ISimplifiedForm extends ISimplifiedFormIdBase {
  /**
   * Sections, keyed by section UUID
   */
  sections: { [uuid: string]: ISimplifiedFormSection };
}

/**
 * Individual question response object
 */
export interface ISimplifiedQuestionResponse {
  /**
   * Response value- here, as a string
   */
  responseText: string;
  /**
   * Response UUID
   */
  responseId: string;
}

/**
 * Single instance of a form submission for a given version of a form
 */
export interface ISimplifiedSubmission extends ISimplifiedFormIdBase {
  /**
   * Submission instance UUID
   */
  submissionId: string;
  /**
   * Responses, keyed by question ID
   */
  questionResponses: { [uuid: string]: ISimplifiedQuestionResponse };
}

/**
 * Single instance of a response object
 */
export type SimplifiedResponseContent = {
  /**
   * UUID of original submission
   */
  submissionId: string;
  /**
   * Original question-level response UUID
   */
  responseId: string;
  /**
   * Actual response text
   */
  responseText: string;
};

/**
 * Map of question IDs -> submission ID and response
 */
export type IFlattenedTextResponse = {
  [questionId: string]: SimplifiedResponseContent;
};

/**
 * Aggregated collection of responses
 */
export interface ISimplifiedResponseCollection extends ISimplifiedFormIdBase {
  /**
   * Sections, keyed by section UUID, each containing a map of responses keyed by question ID
   */
  sections: Map<string, Map<string, Set<SimplifiedResponseContent>>>;
}
