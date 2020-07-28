import { ISimplifiedForm, ISimplifiedSubmission } from './form-types';
import { v4 } from './id-utils';

// to show that this actually works, generate a few IDs up front
const FORM_UUID = v4();
const SECTION_1_UUID = v4();
// NOTE: section 2 is only present on the v2 of the form
const SECTION_2_UUID = v4();

const QUESTION_1_UUID = v4();
const QUESTION_2_UUID = v4();
const QUESTION_3_UUID = v4();

export const ORIGINAL_FORM: ISimplifiedForm = {
  formId: FORM_UUID,
  formVersion: 1,
  sections: {
    [SECTION_1_UUID]: {
      componentType: 'page',
      questions: {
        [QUESTION_1_UUID]: {
          prompt: 'What is your name?',
          questionType: 'text',
        },

        [QUESTION_2_UUID]: {
          prompt: 'What company do you work for?',
          questionType: 'text',
        },
        [QUESTION_3_UUID]: {
          prompt: 'What is your favorite color?',
          questionType: 'text',
        },
      },
    },
  },
};

/**
 * Same fields/IDs, but with a new page + incremented version
 */
export const UPDATED_FORM: ISimplifiedForm = {
  formId: FORM_UUID,
  formVersion: 2,
  sections: {
    [SECTION_1_UUID]: {
      componentType: 'page',
      questions: {
        [QUESTION_1_UUID]: {
          prompt: 'What is your name?',
          questionType: 'text',
        },
        [QUESTION_3_UUID]: {
          prompt: 'What is your favorite color?',
          questionType: 'text',
        },
      },
    },
    // note the new section here
    [SECTION_2_UUID]: {
      componentType: 'page',
      questions: {
        // note that this is the one that moved to section 2 in version 2 of this form
        [QUESTION_2_UUID]: {
          prompt: 'What company do you work for?',
          questionType: 'text',
        },
      },
    },
  },
};

/**
 * All versions of this form, with the same ID
 */
export const FORM_VERSIONS = [ORIGINAL_FORM, UPDATED_FORM];

// response to initial form state
const ORIGINAL_SUBMISSION: ISimplifiedSubmission = {
  formId: FORM_UUID,
  formVersion: 1,
  submissionId: v4(),
  questionResponses: {
    [QUESTION_1_UUID]: {
      responseText: 'Jon Corrin',
      responseId: v4(),
    },
    [QUESTION_2_UUID]: {
      responseText: 'Xilo',
      responseId: v4(),
    },
    [QUESTION_3_UUID]: {
      responseText: 'Blue',
      responseId: v4(),
    },
  },
};

// response to modified form state
const UPDATED_SUBMISSION: ISimplifiedSubmission = {
  formId: FORM_UUID,
  // note the incremented version
  formVersion: 2,
  submissionId: v4(),
  questionResponses: {
    [QUESTION_1_UUID]: {
      responseText: 'Chris Lonardo',
      responseId: v4(),
    },
    [QUESTION_2_UUID]: {
      responseText: '1sm',
      responseId: v4(),
    },
    [QUESTION_3_UUID]: {
      responseText: 'Black',
      responseId: v4(),
    },
  },
};

/**
 * All submissions of to the form (for all versions)
 */
export const ALL_SUBMISSIONS = [ORIGINAL_SUBMISSION, UPDATED_SUBMISSION];
