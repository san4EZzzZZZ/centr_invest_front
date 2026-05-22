export const QUIZZES = [
  {
    id: 'java_senior',
    title: 'Java Senior',
    questions: Array.from({ length: 12 }).map((_, idx) => {
      const questionNumber = idx + 1;
      const optionsCount = questionNumber === 12 ? 1 : 5;
      const options = Array.from({ length: optionsCount }).map((__, optIdx) => ({
        id: `q${questionNumber}_o${optIdx + 1}`,
        label: 'placeholder',
      }));

      return {
        id: `q${questionNumber}`,
        text:
          'lorem ipsum sint commodo magna sint mollit nulla labore commodo ad quis exercitation enim proident laboris cillum aliqua commodo culpa nisi magna quis id',
        options,
        correctOptionId: options[0]?.id ?? null,
      };
    }),
  },
  {
    id: 'python_junior',
    title: 'Python Junior',
    questions: Array.from({ length: 12 }).map((_, idx) => {
      const questionNumber = idx + 1;
      const options = Array.from({ length: 4 }).map((__, optIdx) => ({
        id: `q${questionNumber}_o${optIdx + 1}`,
        label: 'placeholder',
      }));

      return {
        id: `q${questionNumber}`,
        text:
          'lorem ipsum sint commodo magna sint mollit nulla labore commodo ad quis exercitation enim proident laboris cillum aliqua commodo culpa nisi magna quis id',
        options,
        correctOptionId: options[0]?.id ?? null,
      };
    }),
  },
];

