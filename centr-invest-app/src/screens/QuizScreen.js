import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

function cloneAnswer(answer) {
  if (Array.isArray(answer)) return [...answer];
  if (answer && typeof answer === 'object') return { ...answer };
  return answer ?? null;
}

function getDefaultAnswer(question) {
  switch (question?.type) {
    case 'multi':
      return [];
    case 'matching':
      return {};
    case 'text':
      return '';
    default:
      return null;
  }
}

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function isQuestionAnswered(question, answer) {
  if (!question) return false;

  switch (question.type) {
    case 'multi':
      return Array.isArray(answer) && answer.length > 0;
    case 'matching':
      return Boolean(question.rows?.length) && question.rows.every((row) => Boolean(answer?.[row.id]));
    case 'text':
      return normalizeText(answer).length > 0;
    default:
      return Boolean(answer);
  }
}

function isQuestionCorrect(question, answer) {
  if (!question) return false;

  switch (question.type) {
    case 'multi': {
      const selected = Array.isArray(answer) ? [...answer].sort() : [];
      const correct = [...(question.correctOptionIds ?? [])].sort();
      return selected.length > 0 && selected.length === correct.length && selected.every((id, idx) => id === correct[idx]);
    }
    case 'matching':
      return Boolean(question.rows?.length) && question.rows.every((row) => answer?.[row.id] === row.correctOptionId);
    case 'text':
      return normalizeText(answer) === normalizeText(question.answer);
    default:
      return answer === question.correctOptionId;
  }
}

function scoreQuiz(questions, answersByQuestionId) {
  let score = 0;

  for (const question of questions ?? []) {
    if (isQuestionCorrect(question, answersByQuestionId?.[question.id])) {
      score += 1;
    }
  }

  return score;
}

function ChoiceOption({ label, state, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[
        styles.choiceOption,
        state === 'selected' ? styles.choiceOptionSelected : null,
        state === 'correct' ? styles.choiceOptionCorrect : null,
        state === 'wrong' ? styles.choiceOptionWrong : null,
      ]}
    >
      <Text
        style={[
          styles.choiceLabel,
          state === 'selected' ? styles.choiceLabelSelected : null,
          state === 'correct' ? styles.choiceLabelCorrect : null,
          state === 'wrong' ? styles.choiceLabelWrong : null,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function MatchingRow({ row, selectedOptionId, expanded, onToggle, onPick }) {
  const selectedOption = row.options?.find((opt) => opt.id === selectedOptionId);

  return (
    <View style={styles.matchingRow}>
      <Text style={styles.matchingLabel}>{row.label}</Text>

      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.85}
        style={[styles.selectBox, selectedOptionId ? styles.selectBoxSelected : null, expanded ? styles.selectBoxExpanded : null]}
      >
        <Text style={styles.selectText} numberOfLines={1}>
          {selectedOption?.label ?? 'placeholder'}
        </Text>
        <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color="#7C7C7C" />
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.dropdownMenu}>
          {(row.options ?? []).map((opt) => {
            const active = opt.id === selectedOptionId;
            return (
              <TouchableOpacity key={opt.id} onPress={() => onPick(opt.id)} activeOpacity={0.85} style={styles.dropdownItem}>
                <Text style={[styles.dropdownText, active ? styles.dropdownTextActive : null]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

export default function QuizScreen({ quiz, onBack, onFinish }) {
  const insets = useSafeAreaInsets();
  const total = quiz?.questions?.length ?? 0;

  const [index, setIndex] = useState(0);
  const [answersByQuestionId, setAnswersByQuestionId] = useState({});
  const [draftAnswer, setDraftAnswer] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [textFocused, setTextFocused] = useState(false);

  const question = quiz?.questions?.[index];
  const currentNumber = index + 1;
  const isLast = currentNumber >= total;
  const progress = total > 0 ? currentNumber / total : 0;

  useEffect(() => {
    const existingAnswer = answersByQuestionId?.[question?.id];
    const initialAnswer = cloneAnswer(existingAnswer ?? getDefaultAnswer(question));

    setDraftAnswer(initialAnswer);
    setRevealed(Boolean(existingAnswer) && question?.type === 'singleReveal');
    setExpandedRowId(question?.initialOpenRowId ?? null);
    setTextFocused(false);
  }, [question?.id]);

  const canContinue = useMemo(() => isQuestionAnswered(question, draftAnswer), [question, draftAnswer]);
  const isActiveAndCorrect = useMemo(() => isQuestionCorrect(question, draftAnswer), [question, draftAnswer]);

  function updateCurrentAnswer(nextAnswer) {
    const clonedAnswer = cloneAnswer(nextAnswer);
    setDraftAnswer(clonedAnswer);
    setAnswersByQuestionId((prev) => ({
      ...prev,
      [question.id]: clonedAnswer,
    }));
  }

  function handleChoiceSelect(optionId) {
    if (!question) return;

    if (question.type === 'multi') {
      const current = Array.isArray(draftAnswer) ? draftAnswer : [];
      const exists = current.includes(optionId);
      const next = exists ? current.filter((id) => id !== optionId) : [...current, optionId];
      const normalized = (question.options ?? [])
        .map((opt) => opt.id)
        .filter((id) => next.includes(id));
      updateCurrentAnswer(normalized);
      return;
    }

    updateCurrentAnswer(optionId);
    if (question.type === 'singleReveal') {
      setRevealed(true);
    }
  }

  function handleMatchingSelect(rowId, optionId) {
    if (!question) return;

    const next = {
      ...(draftAnswer && typeof draftAnswer === 'object' ? draftAnswer : {}),
      [rowId]: optionId,
    };
    updateCurrentAnswer(next);
    setExpandedRowId(null);
  }

  function handlePrimary() {
    if (!question || !canContinue) return;

    const nextAnswers = {
      ...answersByQuestionId,
      [question.id]: cloneAnswer(draftAnswer),
    };
    setAnswersByQuestionId(nextAnswers);

    if (question.type === 'singleReveal' && !revealed) {
      setRevealed(true);
      return;
    }

    if (isLast) {
      onFinish?.({
        quiz,
        score: scoreQuiz(quiz?.questions ?? [], nextAnswers),
        total,
        answersByQuestionId: nextAnswers,
      });
      return;
    }

    setIndex((value) => Math.min(value + 1, total - 1));
  }

  function renderPrompt() {
    if (!question) return null;

    if (question.type === 'text') {
      const active = textFocused || normalizeText(draftAnswer).length > 0;
      return (
        <View style={[styles.textPromptCard, active ? styles.textPromptCardActive : null]}>
          <Text style={styles.promptText}>{question.text}</Text>
        </View>
      );
    }

    return <Text style={styles.promptText}>{question.text}</Text>;
  }

  function renderBody() {
    if (!question) return null;

    if (question.type === 'matching') {
      return (
        <View style={styles.matchingList}>
          {(question.rows ?? []).map((row) => {
            const selectedOptionId = draftAnswer?.[row.id] ?? null;
            const expanded = expandedRowId === row.id;

            return (
              <MatchingRow
                key={row.id}
                row={row}
                selectedOptionId={selectedOptionId}
                expanded={expanded}
                onToggle={() => setExpandedRowId(expanded ? null : row.id)}
                onPick={(optionId) => handleMatchingSelect(row.id, optionId)}
              />
            );
          })}
        </View>
      );
    }

    if (question.type === 'text') {
      return (
        <View style={styles.textAnswerBlock}>
          <TextInput
            value={typeof draftAnswer === 'string' ? draftAnswer : ''}
            placeholder={question.placeholder ?? 'Введите ответ'}
            placeholderTextColor="#C9C9C9"
            style={styles.textInput}
            onFocus={() => setTextFocused(true)}
            onBlur={() => setTextFocused(false)}
            onChangeText={(value) => updateCurrentAnswer(value)}
            returnKeyType="done"
            onSubmitEditing={handlePrimary}
          />
        </View>
      );
    }

    return (
      <View style={styles.choiceList}>
        {(question.options ?? []).map((option) => {
          const selected = question.type === 'multi' ? Array.isArray(draftAnswer) && draftAnswer.includes(option.id) : draftAnswer === option.id;

          let state = 'idle';
          if (question.type === 'singleReveal' && revealed) {
            if (option.id === question.correctOptionId) state = 'correct';
            else if (selected) state = 'wrong';
          } else if (selected) {
            state = 'selected';
          }

          return <ChoiceOption key={option.id} label={option.label} state={state} onPress={() => handleChoiceSelect(option.id)} />;
        })}
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.flex}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom + 88 }]}
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
                <Ionicons name="chevron-back" size={22} color="#252525" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{quiz?.title ?? 'Тест'}</Text>
              <View style={styles.headerRight} />
            </View>

            <Text style={styles.questionLabel}>Вопрос</Text>
            <Text style={styles.counter}>
              <Text style={styles.counterActive}>{currentNumber}</Text>
              <Text style={styles.counterTotal}>/{total}</Text>
            </Text>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, Math.round(progress * 100)))}%` }]} />
            </View>

            <View style={styles.promptWrap}>{renderPrompt()}</View>

            {renderBody()}

            {question?.type === 'singleReveal' && revealed ? (
              <View style={styles.explanationCard}>
                <Text style={styles.explanationTitle}>Пояснение</Text>
                <Text style={styles.explanationText}>{question.explanation}</Text>

                {question.sourceLabel ? <Text style={styles.sourceLabel}>{question.sourceLabel}</Text> : null}
                {question.sourceUrl ? (
                  <Text style={styles.sourceLink} onPress={() => Linking.openURL(question.sourceUrl)}>
                    {question.sourceUrl}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {question?.type === 'singleReveal' && revealed ? (
              <View style={styles.feedbackBadgeWrap}>
                <View style={[styles.feedbackBadge, isActiveAndCorrect ? styles.feedbackBadgeSuccess : styles.feedbackBadgeError]}>
                  <Text style={styles.feedbackBadgeText}>{isActiveAndCorrect ? 'Верно' : 'Неверно'}</Text>
                </View>
              </View>
            ) : null}
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
            <TouchableOpacity
              onPress={handlePrimary}
              disabled={!canContinue}
              activeOpacity={0.9}
              style={[styles.primaryBtn, !canContinue ? styles.primaryBtnDisabled : null]}
            >
              <Text style={styles.primaryBtnText}>{isLast ? 'Завершить' : 'Далее'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  header: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 30,
    height: 30,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'left',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
    lineHeight: 16,
    color: '#252525',
  },
  headerRight: {
    width: 30,
    height: 30,
  },
  questionLabel: {
    marginTop: 10,
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 16,
    color: '#252525',
  },
  counter: {
    marginTop: 6,
  },
  counterActive: {
    fontFamily: 'Roboto_500Medium',
    fontSize: 28,
    lineHeight: 32,
    color: '#FF5D2E',
  },
  counterTotal: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 28,
    lineHeight: 32,
    color: '#252525',
  },
  progressTrack: {
    marginTop: 14,
    height: 1,
    width: '100%',
    backgroundColor: '#D9D9D9',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7A1136',
  },
  promptWrap: {
    marginTop: 22,
    alignItems: 'center',
  },
  promptText: {
    textAlign: 'center',
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: '#252525',
    maxWidth: 320,
  },
  choiceList: {
    marginTop: 22,
    gap: 12,
  },
  choiceOption: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: '#E2E2E2',
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  choiceOptionSelected: {
    backgroundColor: '#F8E2D5',
    borderColor: '#FF7A45',
  },
  choiceOptionCorrect: {
    backgroundColor: '#E1F4E5',
    borderColor: '#52B86A',
  },
  choiceOptionWrong: {
    backgroundColor: '#F7E2E8',
    borderColor: '#F57A86',
  },
  choiceLabel: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: '#252525',
  },
  choiceLabelSelected: {
    color: '#252525',
  },
  choiceLabelCorrect: {
    color: '#2B8B45',
  },
  choiceLabelWrong: {
    color: '#A83B55',
  },
  matchingList: {
    marginTop: 14,
    gap: 12,
  },
  matchingRow: {
    gap: 8,
  },
  matchingLabel: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: '#252525',
  },
  selectBox: {
    minHeight: 44,
    borderRadius: 6,
    backgroundColor: '#E2E2E2',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectBoxSelected: {
    backgroundColor: '#E9E9E9',
  },
  selectBoxExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  selectText: {
    flex: 1,
    marginRight: 10,
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: '#252525',
  },
  dropdownMenu: {
    backgroundColor: '#E2E2E2',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  dropdownText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: '#252525',
  },
  dropdownTextActive: {
    color: '#7A1136',
  },
  textPromptCard: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  textPromptCardActive: {
    backgroundColor: '#FF8A4F',
    borderColor: '#FF5D2E',
  },
  textAnswerBlock: {
    marginTop: 18,
  },
  textInput: {
    width: '100%',
    minHeight: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 11 : 8,
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: '#252525',
  },
  explanationCard: {
    marginTop: 18,
    paddingHorizontal: 2,
  },
  explanationTitle: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: '#252525',
    marginBottom: 10,
  },
  explanationText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: '#252525',
  },
  sourceLabel: {
    marginTop: 10,
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: '#252525',
  },
  sourceLink: {
    marginTop: 14,
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: '#252525',
  },
  feedbackBadgeWrap: {
    marginTop: 14,
    alignItems: 'flex-start',
  },
  feedbackBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  feedbackBadgeSuccess: {
    backgroundColor: '#E1F4E5',
  },
  feedbackBadgeError: {
    backgroundColor: '#F7E2E8',
  },
  feedbackBadgeText: {
    fontFamily: 'Roboto_500Medium',
    fontSize: 12,
    lineHeight: 16,
    color: '#252525',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
  },
  primaryBtn: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#7A1136',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
    lineHeight: 16,
    color: '#FFFFFF',
  },
});
