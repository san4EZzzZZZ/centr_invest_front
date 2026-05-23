const LONG_TEXT =
  'lorem ipsum sint commodo magna sint mollit nulla labore commodo ad quis exercitation enim proident laboris cillum aliqua commodo culpa nisi magna quis id';

const SOURCE_URL = 'https://get-color.ru/image/';

export const QUESTION_TYPE_OPTIONS = [
  { value: 'single', label: 'С одним правильным ответом' },
  { value: 'multi', label: 'С несколькими правильными ответами' },
  { value: 'matching', label: 'Установление соответствия' },
  { value: 'text', label: 'С кратким текстовым ответом' },
];

export function getQuestionTypeLabel(type) {
  return QUESTION_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? 'Тип вопроса';
}

export function cloneQuiz(quiz) {
  return quiz ? JSON.parse(JSON.stringify(quiz)) : null;
}

function buildOptions(count) {
  return Array.from({ length: count }).map((_, idx) => ({
    id: `o${idx + 1}`,
    label: `Вариант ${idx + 1}`,
  }));
}

function buildSingleQuestion(id, type = 'single') {
  const options = buildOptions(4).map((option, idx) => ({
    ...option,
    id: `${id}_${option.id}`,
    label: idx === 0 ? 'placeholder' : option.label,
  }));

  return {
    id,
    type,
    text: LONG_TEXT,
    options,
    correctOptionId: options[1]?.id ?? null,
  };
}

function buildMultiQuestion(id) {
  const options = buildOptions(4).map((option, idx) => ({
    ...option,
    id: `${id}_${option.id}`,
    label: idx === 0 ? 'placeholder' : option.label,
  }));

  return {
    id,
    type: 'multi',
    text: LONG_TEXT,
    options,
    correctOptionIds: [options[1]?.id, options[2]?.id].filter(Boolean),
  };
}

function buildMatchingQuestion(id, initialOpenRowId = 'java') {
  const rowOptions = buildOptions(4).map((option, idx) => ({
    ...option,
    id: `${id}_${option.id}`,
    label: idx === 0 ? 'placeholder' : option.label,
  }));

  return {
    id,
    type: 'matching',
    text: LONG_TEXT,
    initialOpenRowId,
    rows: [
      {
        id: `${id}_java`,
        label: 'Java -',
        options: rowOptions,
        correctOptionId: rowOptions[0]?.id ?? null,
      },
      {
        id: `${id}_php`,
        label: 'PHP -',
        options: rowOptions,
        correctOptionId: rowOptions[1]?.id ?? null,
      },
      {
        id: `${id}_python`,
        label: 'Python -',
        options: rowOptions,
        correctOptionId: rowOptions[2]?.id ?? null,
      },
    ],
  };
}

function buildTextQuestion(id, answer) {
  return {
    id,
    type: 'text',
    text: LONG_TEXT,
    placeholder: 'Введите краткий ответ',
    answer,
  };
}

function buildDefaultOptions(questionId) {
  return buildOptions(4).map((option, idx) => ({
    ...option,
    id: `${questionId}_o${idx + 1}`,
    label: idx === 0 ? 'Вариант 1' : option.label,
  }));
}

export function createQuestionTemplate(type = 'single', id = `q_${Date.now()}`) {
  const options = buildDefaultOptions(id);

  if (type === 'multi') {
    return {
      id,
      type: 'multi',
      text: LONG_TEXT,
      options,
      correctOptionIds: [options[0]?.id, options[1]?.id].filter(Boolean),
    };
  }

  if (type === 'matching') {
    return {
      id,
      type: 'matching',
      text: LONG_TEXT,
      initialOpenRowId: `${id}_java`,
      rows: [
        {
          id: `${id}_java`,
          label: 'Java -',
          options,
          correctOptionId: options[0]?.id ?? null,
        },
        {
          id: `${id}_php`,
          label: 'PHP -',
          options,
          correctOptionId: options[1]?.id ?? null,
        },
        {
          id: `${id}_python`,
          label: 'Python -',
          options,
          correctOptionId: options[2]?.id ?? null,
        },
      ],
    };
  }

  if (type === 'text') {
    return buildTextQuestion(id, 'ответ');
  }

  return {
    id,
    type: 'single',
    text: LONG_TEXT,
    options,
    correctOptionId: options[0]?.id ?? null,
  };
}

export function createQuizTemplate(title = 'Новый тест') {
  const quizId = `quiz_${Date.now()}`;
  return {
    id: quizId,
    title,
    status: 'draft',
    questions: [createQuestionTemplate('single', `${quizId}_q1`)],
  };
}

export const QUIZZES = [
  {
    id: 'java_senior',
    title: 'Java Senior',
    status: 'published',
    questions: [
      buildSingleQuestion('q1', 'single'),
      {
        ...buildSingleQuestion('q2', 'singleReveal'),
        explanation:
          'lorem ipsum sint commodo magna sint mollit nulla labore commodo ad quis exercitation enim proident laboris cillum aliqua commodo',
        sourceLabel: 'Ссылка на источник',
        sourceUrl: SOURCE_URL,
      },
      buildMultiQuestion('q3'),
      buildMatchingQuestion('q4', 'java'),
      buildMatchingQuestion('q5', 'php'),
      buildTextQuestion('q6', 'коллекции'),
      buildSingleQuestion('q7', 'single'),
      {
        ...buildSingleQuestion('q8', 'singleReveal'),
        explanation:
          'lorem ipsum sint commodo magna sint mollit nulla labore commodo ad quis exercitation enim proident laboris cillum aliqua commodo',
        sourceLabel: 'Ссылка на источник',
        sourceUrl: SOURCE_URL,
      },
      buildMultiQuestion('q9'),
      buildMatchingQuestion('q10', 'python'),
      buildTextQuestion('q11', 'stream'),
      buildSingleQuestion('q12', 'single'),
    ],
  },
  {
    id: 'python_junior',
    title: 'Python Junior',
    status: 'published',
    questions: Array.from({ length: 12 }).map((_, idx) => {
      const questionNumber = idx + 1;
      const options = Array.from({ length: 4 }).map((__, optIdx) => ({
        id: `q${questionNumber}_o${optIdx + 1}`,
        label: optIdx === 0 ? 'placeholder' : `Вариант ${optIdx + 1}`,
      }));

      return {
        id: `q${questionNumber}`,
        type: 'single',
        text: LONG_TEXT,
        options,
        correctOptionId: options[0]?.id ?? null,
      };
    }),
  },
];
