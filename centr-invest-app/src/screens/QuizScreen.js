import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity, TextInput } from "../components/SilentTouchables";
import { Feather, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { attemptsApi } from '../api/client';

function getDefaultAnswer(question) {
  switch (question?.type) {
    case 'MULTIPLE_CHOICE':
      return [];
    case 'MATCHING':
      return {};
    case 'SHORT_TEXT':
      return '';
    default:
      return [];
  }
}

function isQuestionAnswered(question, answer) {
  if (!question) return false;
  if (question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE') return Array.isArray(answer) && answer.length > 0;
  if (question.type === 'MATCHING') return (question.matchLeftItems ?? []).every((item) => Boolean(answer?.[item]));
  if (question.type === 'SHORT_TEXT') return String(answer ?? '').trim().length > 0;
  return false;
}

function buildAnswerRequest(question, answer) {
  if (question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE') return { selectedOptionIds: answer };
  if (question.type === 'MATCHING') return { matches: answer };
  return { textAnswer: String(answer ?? '').trim() };
}

function ChoiceOption({ label, selected, onPress, disabled }) {
  return (
    <TouchableOpacity 
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.88}
      style={[styles.choiceOption, selected ? styles.choiceOptionSelected : null]}
    >
      <Text style={styles.choiceLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function MatchingRow({ leftItem, rightItems, selectedValue, expanded, disabled, onToggle, onPick }) {
  return (
    <View style={styles.matchingRow}>
      <Text style={styles.matchingLabel}>{leftItem}</Text>
      <TouchableOpacity 
        disabled={disabled}
        onPress={onToggle}
        activeOpacity={0.85}
        style={[styles.selectBox, selectedValue ? styles.selectBoxSelected : null, expanded ? styles.selectBoxExpanded : null]}
      >
        <Text style={styles.selectText} numberOfLines={1}>{selectedValue || 'Выберите вариант'}</Text>
        <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color="#7C7C7C" />
      </TouchableOpacity>
      {expanded ? (
        <View style={styles.dropdownMenu}>
          {rightItems.map((rightItem) => (
            <TouchableOpacity  key={rightItem} onPress={() => onPick(rightItem)} activeOpacity={0.85} style={styles.dropdownItem}>
              <Text style={[styles.dropdownText, rightItem === selectedValue ? styles.dropdownTextActive : null]}>{rightItem}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function QuizScreen({ quiz, onBack, onFinish }) {
  const insets = useSafeAreaInsets();

  const [attemptId, setAttemptId] = useState(null);
  const [question, setQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(quiz?.questionCount ?? 0);
  const [draftAnswer, setDraftAnswer] = useState(null);
  const [answerResponse, setAnswerResponse] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [textFocused, setTextFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function startAttempt() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await attemptsApi.start(quiz.id);
        if (ignore) return;
        setAttemptId(response.attemptId);
        setQuestion(response.question);
        setQuestionNumber(1);
        const state = await attemptsApi.get(response.attemptId).catch(() => null);
        setTotalQuestions(state?.totalQuestions ?? quiz?.questionCount ?? 0);
        setDraftAnswer(getDefaultAnswer(response.question));
        setAnswerResponse(null);
        setExpandedRowId(response.question?.matchLeftItems?.[0] ?? null);
      } catch (startError) {
        if (!ignore) setError(startError.message || 'Не удалось начать тест');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    if (quiz?.id) startAttempt();

    return () => {
      ignore = true;
    };
  }, [quiz?.id]);

  const progress = totalQuestions > 0 ? questionNumber / totalQuestions : 0;
  const canContinue = useMemo(() => isQuestionAnswered(question, draftAnswer), [question, draftAnswer]);

  function handleChoiceSelect(optionId) {
    if (!question || answerResponse) return;
    if (question.type === 'MULTIPLE_CHOICE') {
      const current = Array.isArray(draftAnswer) ? draftAnswer : [];
      setDraftAnswer(current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId]);
      return;
    }
    setDraftAnswer([optionId]);
  }

  function handleMatchingSelect(leftItem, rightItem) {
    if (!question || answerResponse) return;
    setDraftAnswer((prev) => ({ ...(prev && typeof prev === 'object' ? prev : {}), [leftItem]: rightItem }));
    setExpandedRowId(null);
  }

  async function handlePrimary() {
    if (!question || !canContinue || !attemptId) return;

    if (answerResponse) {
      if (answerResponse.result) {
        onFinish?.({ quiz, result: answerResponse.result, attemptId });
        return;
      }
      if (answerResponse.nextQuestion) {
        setQuestion(answerResponse.nextQuestion);
        setQuestionNumber((value) => value + 1);
        setDraftAnswer(getDefaultAnswer(answerResponse.nextQuestion));
        setAnswerResponse(null);
        setExpandedRowId(answerResponse.nextQuestion?.matchLeftItems?.[0] ?? null);
        setTextFocused(false);
      }
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await attemptsApi.answer(attemptId, buildAnswerRequest(question, draftAnswer));
      setAnswerResponse(response);
    } catch (submitError) {
      setError(submitError.message || 'Не удалось отправить ответ');
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderBody() {
    if (!question) return null;

    if (question.type === 'MATCHING') {
      return (
        <View style={styles.matchingList}>
          {(question.matchLeftItems ?? []).map((leftItem) => (
            <MatchingRow
              key={leftItem}
              leftItem={leftItem}
              rightItems={question.matchRightItems ?? []}
              selectedValue={draftAnswer?.[leftItem]}
              expanded={expandedRowId === leftItem}
              disabled={Boolean(answerResponse)}
              onToggle={() => setExpandedRowId(expandedRowId === leftItem ? null : leftItem)}
              onPick={(rightItem) => handleMatchingSelect(leftItem, rightItem)}
            />
          ))}
        </View>
      );
    }

    if (question.type === 'SHORT_TEXT') {
      return (
        <View style={styles.textAnswerBlock}>
          <TextInput 
            editable={!answerResponse}
            value={typeof draftAnswer === 'string' ? draftAnswer : ''}
            placeholder="Введите ответ"
            placeholderTextColor="#C9C9C9"
            style={styles.textInput}
            onFocus={() => setTextFocused(true)}
            onBlur={() => setTextFocused(false)}
            onChangeText={setDraftAnswer}
            returnKeyType="done"
            onSubmitEditing={handlePrimary}
          />
        </View>
      );
    }

    return (
      <View style={styles.choiceList}>
        {(question.options ?? []).map((option) => (
          <ChoiceOption
            key={option.id}
            label={option.text}
            selected={Array.isArray(draftAnswer) && draftAnswer.includes(option.id)}
            disabled={Boolean(answerResponse)}
            onPress={() => handleChoiceSelect(option.id)}
          />
        ))}
      </View>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} style={styles.screen}>
        <View style={styles.centerState}>
          <ActivityIndicator color="#7A1136" />
          <Text style={styles.centerText}>Запускаем тест...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !question) {
    return (
      <SafeAreaView edges={['top']} style={styles.screen}>
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity  onPress={onBack} style={styles.backHomeBtn}>
            <Text style={styles.backHomeText}>Назад</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
              <TouchableOpacity  onPress={onBack} style={styles.backBtn} hitSlop={12}>
                <Ionicons name="chevron-back" size={22} color="#252525" />
              </TouchableOpacity>
              <Text numberOfLines={1} style={styles.headerTitle}>{quiz?.title ?? 'Тест'}</Text>
              <View style={styles.headerRight} />
            </View>

            <Text style={styles.questionLabel}>Вопрос</Text>
            <Text style={styles.counter}>
              <Text style={styles.counterActive}>{questionNumber}</Text>
              <Text style={styles.counterTotal}>/{totalQuestions || '?'}</Text>
            </Text>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, Math.round(progress * 100)))}%` }]} />
            </View>

            <View style={styles.promptWrap}>
              <View style={[question?.type === 'SHORT_TEXT' ? styles.textPromptCard : null, textFocused ? styles.textPromptCardActive : null]}>
                <Text style={styles.promptText}>{question?.prompt}</Text>
              </View>
            </View>

            {renderBody()}

            {error ? (
              <View style={[styles.explanationCard, styles.explanationError]}>
                <Text style={styles.explanationText}>{error}</Text>
              </View>
            ) : null}

            {answerResponse ? (
              <>
                <View style={styles.explanationCard}>
                  <Text style={styles.explanationTitle}>Пояснение</Text>
                  <Text style={styles.explanationText}>{answerResponse.explanation}</Text>
                  {answerResponse.checkedByAi ? <Text style={styles.sourceLabel}>AI проверка: {Math.round((answerResponse.aiConfidence ?? 0) * 100)}%</Text> : null}
                  {answerResponse.explanationGeneratedByAi ? <Text style={styles.explanationText}>Пояснение сгенерировано AI</Text> : null}
                  {answerResponse.readMoreUrl ? (
                    <Text style={styles.sourceLink} onPress={() => Linking.openURL(answerResponse.readMoreUrl)}>
                      {answerResponse.readMoreUrl}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.feedbackBadgeWrap}>
                  <View style={[styles.feedbackBadge, answerResponse.correct ? styles.feedbackBadgeSuccess : styles.feedbackBadgeError]}>
                    <Text style={styles.feedbackBadgeText}>{answerResponse.correct ? 'Верно' : 'Неверно'}</Text>
                  </View>
                </View>
              </>
            ) : null}
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
            <TouchableOpacity 
              onPress={handlePrimary}
              disabled={(!canContinue && !answerResponse) || isSubmitting}
              activeOpacity={0.9}
              style={[styles.primaryBtn, (!canContinue && !answerResponse) || isSubmitting ? styles.primaryBtnDisabled : null]}
            >
              <Text style={styles.primaryBtnText}>
                {isSubmitting ? 'Отправляем...' : answerResponse ? (answerResponse.result ? 'Показать результат' : 'Далее') : 'Ответить'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  centerText: { marginTop: 12, fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 18, color: '#8A8983' },
  errorText: { fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 18, color: '#F23030', textAlign: 'center' },
  backHomeBtn: { marginTop: 18, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, backgroundColor: '#7A1136' },
  backHomeText: { color: '#FFFFFF', fontFamily: 'Roboto_500Medium' },
  content: { paddingHorizontal: 16, paddingTop: 6 },
  header: { height: 40, flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 30, height: 30, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'left', fontFamily: 'Roboto_500Medium', fontSize: 16, lineHeight: 16, color: '#252525' },
  headerRight: { width: 30, height: 30 },
  questionLabel: { marginTop: 10, fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 16, color: '#252525' },
  counter: { marginTop: 6 },
  counterActive: { fontFamily: 'Roboto_500Medium', fontSize: 28, lineHeight: 32, color: '#FF5D2E' },
  counterTotal: { fontFamily: 'Roboto_400Regular', fontSize: 28, lineHeight: 32, color: '#252525' },
  progressTrack: { marginTop: 14, height: 1, width: '100%', backgroundColor: '#D9D9D9', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#7A1136' },
  promptWrap: { marginTop: 22, alignItems: 'center' },
  promptText: { textAlign: 'center', fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 18, color: '#252525', maxWidth: 320 },
  choiceList: { marginTop: 22, gap: 12 },
  choiceOption: { minHeight: 48, borderRadius: 8, backgroundColor: '#E2E2E2', borderWidth: 1, borderColor: 'transparent', paddingHorizontal: 12, justifyContent: 'center' },
  choiceOptionSelected: { backgroundColor: '#F8E2D5', borderColor: '#FF7A45' },
  choiceLabel: { fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 18, color: '#252525' },
  matchingList: { marginTop: 14, gap: 12 },
  matchingRow: { gap: 8 },
  matchingLabel: { fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 18, color: '#252525' },
  selectBox: { minHeight: 44, borderRadius: 6, backgroundColor: '#E2E2E2', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectBoxSelected: { backgroundColor: '#E9E9E9' },
  selectBoxExpanded: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  selectText: { flex: 1, marginRight: 10, fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 18, color: '#252525' },
  dropdownMenu: { backgroundColor: '#E2E2E2', borderBottomLeftRadius: 6, borderBottomRightRadius: 6, paddingBottom: 8, overflow: 'hidden' },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 5 },
  dropdownText: { fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 18, color: '#252525' },
  dropdownTextActive: { color: '#7A1136' },
  textPromptCard: { width: '100%', borderRadius: 8, borderWidth: 1, borderColor: '#EFEFEF', backgroundColor: '#FFFFFF', paddingVertical: 10, paddingHorizontal: 14 },
  textPromptCardActive: { backgroundColor: '#FF8A4F', borderColor: '#FF5D2E' },
  textAnswerBlock: { marginTop: 18 },
  textInput: { width: '100%', minHeight: 40, borderRadius: 6, borderWidth: 1, borderColor: '#E3E3E3', paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 11 : 8, fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 18, color: '#252525' },
  explanationCard: { marginTop: 18, paddingHorizontal: 2 },
  explanationError: { borderRadius: 10, padding: 12, backgroundColor: '#FFF0EB' },
  explanationTitle: { fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 18, color: '#252525', marginBottom: 10 },
  explanationText: { fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 18, color: '#252525' },
  sourceLabel: { marginTop: 10, fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 18, color: '#252525' },
  sourceLink: { marginTop: 14, fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 18, color: '#7A1136' },
  feedbackBadgeWrap: { marginTop: 14, alignItems: 'flex-start' },
  feedbackBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  feedbackBadgeSuccess: { backgroundColor: '#E1F4E5' },
  feedbackBadgeError: { backgroundColor: '#F7E2E8' },
  feedbackBadgeText: { fontFamily: 'Roboto_500Medium', fontSize: 12, lineHeight: 16, color: '#252525' },
  footer: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#FFFFFF' },
  primaryBtn: { height: 56, borderRadius: 12, backgroundColor: '#7A1136', alignItems: 'center', justifyContent: 'center' },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontFamily: 'Roboto_500Medium', fontSize: 16, lineHeight: 16, color: '#FFFFFF' },
});
