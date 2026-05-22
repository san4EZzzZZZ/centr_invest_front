const LONG_TEXT =
  'lorem ipsum sint commodo magna sint mollit nulla labore commodo ad quis exercitation enim proident laboris cillum aliqua commodo culpa nisi magna quis id';

const SOURCE_URL = 'https://get-color.ru/image/';

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

export const QUIZZES = [
  {
    id: 'java_senior',
    title: 'Java Senior',
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
