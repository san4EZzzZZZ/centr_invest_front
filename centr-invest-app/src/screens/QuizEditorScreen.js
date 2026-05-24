import React, { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { TouchableOpacity, TextInput } from "../components/SilentTouchables";
import { Feather, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  QUESTION_TYPE_OPTIONS,
  cloneQuiz,
  createQuestionTemplate,
  createQuizTemplate,
  getQuestionTypeLabel,
} from '../data/quizzes';

function cloneQuestion(question) {
  return question ? JSON.parse(JSON.stringify(question)) : null;
}

function normalizeQuestion(question, index) {
  if (!question) {
    return {
      ...createQuestionTemplate('single', `q_${Date.now()}_${index}`),
      showExplanation: false,
    };
  }

  const normalizedType = question.type === 'singleReveal' ? 'single' : question.type || 'single';
  const nextQuestion = cloneQuestion(question) ?? createQuestionTemplate(normalizedType, question.id ?? `q_${Date.now()}_${index}`);
  nextQuestion.id = nextQuestion.id ?? `q_${Date.now()}_${index}`;
  nextQuestion.type = normalizedType;
  nextQuestion.showExplanation = question.type === 'singleReveal' || Boolean(question.showExplanation);

  if (normalizedType === 'single' || normalizedType === 'multi') {
    if (!Array.isArray(nextQuestion.options) || !nextQuestion.options.length) {
      const template = createQuestionTemplate(normalizedType, nextQuestion.id);
      nextQuestion.options = template.options;
      nextQuestion.correctOptionId = template.correctOptionId ?? nextQuestion.correctOptionId ?? null;
      nextQuestion.correctOptionIds = template.correctOptionIds ?? nextQuestion.correctOptionIds ?? [];
    }
  }

  if (normalizedType === 'matching') {
    if (!Array.isArray(nextQuestion.rows) || !nextQuestion.rows.length) {
      const template = createQuestionTemplate('matching', nextQuestion.id);
      nextQuestion.options = template.rows[0]?.options ?? nextQuestion.options ?? [];
      nextQuestion.rows = template.rows;
      nextQuestion.initialOpenRowId = template.initialOpenRowId;
    }

    if (!Array.isArray(nextQuestion.options) || !nextQuestion.options.length) {
      const template = createQuestionTemplate('matching', nextQuestion.id);
      nextQuestion.options = template.rows[0]?.options ?? [];
      nextQuestion.rows = template.rows;
      nextQuestion.initialOpenRowId = template.initialOpenRowId;
    }

    nextQuestion.rows = (nextQuestion.rows ?? []).map((row) => ({
      ...row,
      options: nextQuestion.options,
    }));
  }

  if (normalizedType === 'text') {
    nextQuestion.answer = typeof nextQuestion.answer === 'string' ? nextQuestion.answer : '';
  }

  return nextQuestion;
}

function createNewQuestion(type, index) {
  const questionId = `q_${Date.now()}_${index}`;
  const question = createQuestionTemplate(type, questionId);
  return {
    ...question,
    showExplanation: type === 'singleReveal',
  };
}

function getTypeLabelFromValue(type) {
  return QUESTION_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? getQuestionTypeLabel(type);
}

function optionLabel(question, optionId) {
  return question.options?.find((option) => option.id === optionId)?.label ?? 'Выберите вариант';
}

function stripEditorFields(question) {
  const nextQuestion = cloneQuestion(question) ?? {};
  const showExplanation = Boolean(nextQuestion.showExplanation);
  delete nextQuestion.showExplanation;

  if (nextQuestion.type === 'single' || nextQuestion.type === 'singleReveal') {
    nextQuestion.type = showExplanation ? 'singleReveal' : 'single';
    if (!Array.isArray(nextQuestion.options) || !nextQuestion.options.length) {
      const template = createQuestionTemplate('single', nextQuestion.id ?? `q_${Date.now()}`);
      nextQuestion.options = template.options;
      nextQuestion.correctOptionId = template.correctOptionId;
    }

    const availableIds = new Set((nextQuestion.options ?? []).map((option) => option.id));
    if (!availableIds.has(nextQuestion.correctOptionId)) {
      nextQuestion.correctOptionId = nextQuestion.options?.[0]?.id ?? null;
    }
    return nextQuestion;
  }

  if (nextQuestion.type === 'multi') {
    if (!Array.isArray(nextQuestion.options) || !nextQuestion.options.length) {
      const template = createQuestionTemplate('multi', nextQuestion.id ?? `q_${Date.now()}`);
      nextQuestion.options = template.options;
      nextQuestion.correctOptionIds = template.correctOptionIds;
    }

    const availableIds = new Set((nextQuestion.options ?? []).map((option) => option.id));
    nextQuestion.correctOptionIds = (nextQuestion.correctOptionIds ?? []).filter((optionId) => availableIds.has(optionId));
    return nextQuestion;
  }

  if (nextQuestion.type === 'matching') {
    if (!Array.isArray(nextQuestion.rows) || !nextQuestion.rows.length) {
      const template = createQuestionTemplate('matching', nextQuestion.id ?? `q_${Date.now()}`);
      nextQuestion.rows = template.rows;
      nextQuestion.initialOpenRowId = template.initialOpenRowId;
      nextQuestion.options = template.rows[0]?.options ?? [];
    }

    const availableIds = new Set((nextQuestion.options ?? []).map((option) => option.id));
    nextQuestion.rows = (nextQuestion.rows ?? []).map((row) => ({
      ...row,
      options: nextQuestion.options,
      correctOptionId: availableIds.has(row.correctOptionId) ? row.correctOptionId : nextQuestion.options?.[0]?.id ?? null,
    }));
    return nextQuestion;
  }

  if (nextQuestion.type === 'text') {
    nextQuestion.answer = typeof nextQuestion.answer === 'string' ? nextQuestion.answer : '';
    return nextQuestion;
  }

  return nextQuestion;
}

function createInitialDraft(quiz) {
  if (!quiz) {
    return createQuizTemplate();
  }

  const cloned = cloneQuiz(quiz) ?? createQuizTemplate();
  return {
    ...cloned,
    status: cloned.status ?? 'draft',
    questions: (cloned.questions ?? []).length
      ? cloned.questions.map((question, index) => normalizeQuestion(question, index + 1))
      : [createNewQuestion('single', 1)],
  };
}

export default function QuizEditorScreen({ quiz, onCancel, onSave }) {
  const [draftQuiz, setDraftQuiz] = useState(() => createInitialDraft(quiz));
  const [typePickerForQuestion, setTypePickerForQuestion] = useState(null);
  const [answerPicker, setAnswerPicker] = useState(null);

  useEffect(() => {
    setDraftQuiz(createInitialDraft(quiz));
  }, [quiz]);

  const editorTitle = quiz ? 'Редактирование теста' : 'Создание теста';
  const nextQuestionIndex = (draftQuiz.questions?.length ?? 0) + 1;

  function updateQuizField(field, value) {
    setDraftQuiz((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateQuestion(questionId, updater) {
    setDraftQuiz((prev) => ({
      ...prev,
      questions: (prev.questions ?? []).map((question) => {
        if (question.id !== questionId) return question;
        const next = typeof updater === 'function' ? updater(question) : { ...question, ...updater };
        return normalizeQuestion(next, 1);
      }),
    }));
  }

  function addQuestion() {
    setDraftQuiz((prev) => ({
      ...prev,
      questions: [...(prev.questions ?? []), createNewQuestion('single', (prev.questions?.length ?? 0) + 1)],
    }));
  }

  function removeQuestion(questionId) {
    setDraftQuiz((prev) => {
      const nextQuestions = (prev.questions ?? []).filter((question) => question.id !== questionId);
      return {
        ...prev,
        questions: nextQuestions.length ? nextQuestions : [createNewQuestion('single', 1)],
      };
    });
  }

  function addOption(questionId) {
    updateQuestion(questionId, (question) => {
      const nextQuestion = cloneQuestion(question) ?? {};
      const nextOptions = [...(nextQuestion.options ?? [])];
      const newOptionId = `${questionId}_o${nextOptions.length + 1}_${Date.now()}`;
      nextOptions.push({
        id: newOptionId,
        label: `Вариант ${nextOptions.length + 1}`,
      });

      nextQuestion.options = nextOptions;
      return nextQuestion;
    });
  }

  function updateOption(questionId, optionId, label) {
    updateQuestion(questionId, (question) => ({
      ...question,
      options: (question.options ?? []).map((option) => (option.id === optionId ? { ...option, label } : option)),
      rows: question.type === 'matching'
        ? (question.rows ?? []).map((row) => ({
            ...row,
            options: (question.options ?? []).map((option) => (option.id === optionId ? { ...option, label } : option)),
          }))
        : question.rows,
    }));
  }

  function removeOption(questionId, optionId) {
    updateQuestion(questionId, (question) => {
      const nextOptions = (question.options ?? []).filter((option) => option.id !== optionId);
      const nextQuestion = { ...question, options: nextOptions };

      if (question.type === 'multi') {
        nextQuestion.correctOptionIds = (question.correctOptionIds ?? []).filter((id) => id !== optionId);
      } else if (question.type === 'matching') {
        nextQuestion.rows = (question.rows ?? []).map((row) => ({
          ...row,
          options: nextOptions,
          correctOptionId: row.correctOptionId === optionId ? nextOptions[0]?.id ?? null : row.correctOptionId,
        }));
      } else {
        nextQuestion.correctOptionId = question.correctOptionId === optionId ? nextOptions[0]?.id ?? null : question.correctOptionId;
      }

      return nextQuestion;
    });
  }

  function toggleMultiCorrect(questionId, optionId) {
    updateQuestion(questionId, (question) => {
      const current = Array.isArray(question.correctOptionIds) ? question.correctOptionIds : [];
      const exists = current.includes(optionId);
      const nextCorrectOptionIds = exists ? current.filter((id) => id !== optionId) : [...current, optionId];
      return { ...question, correctOptionIds: nextCorrectOptionIds };
    });
  }

  function pickSingleCorrect(questionId, optionId) {
    updateQuestion(questionId, { correctOptionId: optionId });
  }

  function updateMatchingRow(questionId, rowId, patch) {
    updateQuestion(questionId, (question) => ({
      ...question,
      rows: (question.rows ?? []).map((row) => (row.id === rowId ? { ...row, ...patch } : row)),
    }));
  }

  function setMatchingCorrect(questionId, rowId, optionId) {
    updateMatchingRow(questionId, rowId, { correctOptionId: optionId });
    setAnswerPicker(null);
  }

  function updateQuestionType(questionId, nextType) {
    updateQuestion(questionId, (question) => {
      const nextQuestion = { ...question, type: nextType };

      if (nextType === 'single' || nextType === 'multi') {
        if (!Array.isArray(nextQuestion.options) || !nextQuestion.options.length) {
          const template = createQuestionTemplate(nextType, nextQuestion.id);
          nextQuestion.options = template.options;
          nextQuestion.correctOptionId = template.correctOptionId ?? nextQuestion.correctOptionId ?? null;
          nextQuestion.correctOptionIds = template.correctOptionIds ?? nextQuestion.correctOptionIds ?? [];
        }
      }

      if (nextType === 'matching') {
        const template = createQuestionTemplate('matching', nextQuestion.id);
        nextQuestion.options = template.rows[0]?.options ?? nextQuestion.options ?? [];
        nextQuestion.rows = template.rows;
        nextQuestion.initialOpenRowId = template.initialOpenRowId;
      }

      if (nextType === 'text') {
        nextQuestion.answer = typeof nextQuestion.answer === 'string' ? nextQuestion.answer : '';
      }

      return nextQuestion;
    });
  }

  function toggleExplanation(questionId, value) {
    updateQuestion(questionId, (question) => ({
      ...question,
      showExplanation: value,
      type: value ? 'singleReveal' : 'single',
    }));
  }

  function finalizeQuiz(quizDraft) {
    return {
      ...quizDraft,
      title: String(quizDraft.title || '').trim() || 'Новый тест',
      questions: (quizDraft.questions ?? []).map((question) => stripEditorFields(question)),
    };
  }

  function handleSave() {
    onSave?.(finalizeQuiz(draftQuiz));
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity  onPress={onCancel} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color="#252525" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editorTitle}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Название</Text>
          <TextInput 
            value={draftQuiz.title ?? ''}
            onChangeText={(value) => updateQuizField('title', value)}
            placeholder="Например, Python Junior"
            placeholderTextColor="#D2D2D2"
            style={styles.input}
          />
        </View>

        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>Вопросы</Text>
        </View>

        {(draftQuiz.questions ?? []).map((question, index) => (
          <View key={question.id} style={styles.card}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionIndex}>Вопрос {index + 1}</Text>
              <TouchableOpacity  onPress={() => removeQuestion(question.id)} style={styles.removeQuestionBtn} activeOpacity={0.8}>
                <Feather name="trash-2" size={16} color="#D83131" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Тип вопроса</Text>
            <TouchableOpacity 
              activeOpacity={0.9}
              style={styles.selectBox}
              onPress={() => setTypePickerForQuestion(question.id)}
            >
              <Text style={styles.selectText}>{getTypeLabelFromValue(question.type === 'singleReveal' ? 'single' : question.type)}</Text>
              <Feather name="chevron-down" size={16} color="#7C7C7C" />
            </TouchableOpacity>

            <Text style={styles.label}>Текст вопроса</Text>
            <TextInput 
              value={question.text ?? ''}
              onChangeText={(value) => updateQuestion(question.id, { text: value })}
              placeholder="Введите вопрос"
              placeholderTextColor="#D2D2D2"
              style={styles.input}
              multiline
            />

            {(question.type === 'single' || question.type === 'singleReveal' || question.type === 'multi') ? (
              <>
                <Text style={styles.label}>Ответы</Text>
                <View style={styles.optionList}>
                  {(question.options ?? []).map((option) => {
                    const isMulti = question.type === 'multi';
                    const isSelected = isMulti
                      ? Array.isArray(question.correctOptionIds) && question.correctOptionIds.includes(option.id)
                      : question.correctOptionId === option.id;

                    return (
                      <View key={option.id} style={styles.optionRow}>
                        <TextInput 
                          value={option.label ?? ''}
                          onChangeText={(value) => updateOption(question.id, option.id, value)}
                          placeholder="Введите ответ"
                          placeholderTextColor="#D2D2D2"
                          style={styles.optionInput}
                        />

                        <TouchableOpacity 
                          activeOpacity={0.85}
                          style={[styles.correctBtn, isSelected ? styles.correctBtnActive : null]}
                          onPress={() => (isMulti ? toggleMultiCorrect(question.id, option.id) : pickSingleCorrect(question.id, option.id))}
                        >
                          <Ionicons
                            name={isMulti ? 'checkmark' : 'radio-button-on'}
                            size={16}
                            color={isSelected ? '#26A144' : '#7C7C7C'}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity 
                          activeOpacity={0.85}
                          style={styles.deleteOptionBtn}
                          onPress={() => removeOption(question.id, option.id)}
                        >
                          <Feather name="trash-2" size={14} color="#7C7C7C" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>

                <TouchableOpacity  style={styles.addAnswerBtn} onPress={() => addOption(question.id)} activeOpacity={0.9}>
                  <Feather name="plus" size={14} color="#FF5D2E" />
                  <Text style={styles.addAnswerText}>Добавить ответ</Text>
                </TouchableOpacity>
              </>
            ) : null}

            {question.type === 'matching' ? (
              <>
                <Text style={styles.label}>Варианты для сопоставления</Text>
                <View style={styles.optionList}>
                  {(question.options ?? []).map((option) => (
                    <View key={option.id} style={styles.optionRow}>
                      <TextInput 
                        value={option.label ?? ''}
                        onChangeText={(value) => updateOption(question.id, option.id, value)}
                        placeholder="Вариант"
                        placeholderTextColor="#D2D2D2"
                        style={styles.optionInput}
                      />
                    </View>
                  ))}
                </View>

                <Text style={styles.label}>Соответствия</Text>
                <View style={styles.matchingList}>
                  {(question.rows ?? []).map((row) => (
                    <View key={row.id} style={styles.matchingRow}>
                      <TextInput 
                        value={row.label ?? ''}
                        onChangeText={(value) => updateMatchingRow(question.id, row.id, { label: value })}
                        placeholder="Подпись строки"
                        placeholderTextColor="#D2D2D2"
                        style={[styles.input, styles.matchingLabelInput]}
                      />

                      <TouchableOpacity 
                        activeOpacity={0.9}
                        style={styles.selectBox}
                        onPress={() => setAnswerPicker({ questionId: question.id, rowId: row.id })}
                      >
                        <Text style={styles.selectText}>{optionLabel(question, row.correctOptionId)}</Text>
                        <Feather name="chevron-down" size={16} color="#7C7C7C" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </>
            ) : null}

            {question.type === 'text' ? (
              <>
                <Text style={styles.label}>Правильный ответ</Text>
                <TextInput 
                  value={question.answer ?? ''}
                  onChangeText={(value) => updateQuestion(question.id, { answer: value })}
                  placeholder="Введите правильный ответ"
                  placeholderTextColor="#D2D2D2"
                  style={styles.input}
                />
              </>
            ) : null}

            {(question.type === 'single' || question.type === 'singleReveal') ? (
              <>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Показывать пояснение после ответа</Text>
                  <Switch
                    value={Boolean(question.showExplanation)}
                    onValueChange={(value) => toggleExplanation(question.id, value)}
                    trackColor={{ false: '#D9D9D9', true: '#F9C7B4' }}
                    thumbColor={question.showExplanation ? '#FF5D2E' : '#FFFFFF'}
                  />
                </View>

                {question.showExplanation ? (
                  <>
                    <Text style={styles.label}>Пояснение</Text>
                    <TextInput 
                      value={question.explanation ?? ''}
                      onChangeText={(value) => updateQuestion(question.id, { explanation: value })}
                      placeholder="Введите пояснение"
                      placeholderTextColor="#D2D2D2"
                      style={styles.input}
                      multiline
                    />

                    <Text style={styles.label}>Ссылка на источник</Text>
                    <TextInput 
                      value={question.sourceUrl ?? ''}
                      onChangeText={(value) => updateQuestion(question.id, { sourceUrl: value })}
                      placeholder="Введите ссылку"
                      placeholderTextColor="#D2D2D2"
                      style={styles.input}
                    />
                  </>
                ) : null}
              </>
            ) : null}
          </View>
        ))}

        <TouchableOpacity  style={styles.addQuestionBtn} onPress={addQuestion} activeOpacity={0.9}>
          <Feather name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.addQuestionText}>Добавить вопрос</Text>
        </TouchableOpacity>

        <TouchableOpacity  style={styles.saveBtn} onPress={handleSave} activeOpacity={0.9}>
          <Text style={styles.saveBtnText}>Завершить</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal transparent visible={Boolean(typePickerForQuestion)} animationType="fade" onRequestClose={() => setTypePickerForQuestion(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Тип вопроса</Text>
            {QUESTION_TYPE_OPTIONS.map((option) => (
              <TouchableOpacity 
                key={option.value}
                style={styles.modalOption}
                onPress={() => {
                  updateQuestionType(typePickerForQuestion, option.value);
                  setTypePickerForQuestion(null);
                }}
              >
                <Text style={styles.modalOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity  style={styles.modalCloseBtn} onPress={() => setTypePickerForQuestion(null)}>
              <Text style={styles.modalCloseText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={Boolean(answerPicker)} animationType="fade" onRequestClose={() => setAnswerPicker(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Выберите ответ</Text>
            {(draftQuiz.questions ?? [])
              .find((question) => question.id === answerPicker?.questionId)
              ?.options?.map((option) => (
                <TouchableOpacity 
                  key={option.id}
                  style={styles.modalOption}
                  onPress={() => setMatchingCorrect(answerPicker.questionId, answerPicker.rowId, option.id)}
                >
                  <Text style={styles.modalOptionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            <TouchableOpacity  style={styles.modalCloseBtn} onPress={() => setAnswerPicker(null)}>
              <Text style={styles.modalCloseText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  backBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 20,
    color: '#252525',
    textAlign: 'left',
  },
  headerRight: {
    width: 28,
    height: 28,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
  },
  label: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 14,
    color: '#252525',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#EAEBED',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 18,
    color: '#252525',
    backgroundColor: '#FFFFFF',
  },
  sectionTitleWrap: {
    paddingHorizontal: 2,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 18,
    color: '#FFFFFF',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionIndex: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 18,
    color: '#252525',
  },
  removeQuestionBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD6D6',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  selectBox: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#EAEBED',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  selectText: {
    flex: 1,
    marginRight: 10,
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 18,
    color: '#252525',
  },
  optionList: {
    gap: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionInput: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#EAEBED',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 18,
    color: '#252525',
    backgroundColor: '#FFFFFF',
  },
  correctBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EAEBED',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  correctBtnActive: {
    borderColor: '#26A144',
    backgroundColor: '#E9F8EE',
  },
  deleteOptionBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EAEBED',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  addAnswerBtn: {
    marginTop: 10,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFF1EA',
    borderWidth: 1,
    borderColor: '#FFB89E',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  addAnswerText: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 14,
    color: '#FF5D2E',
  },
  matchingList: {
    gap: 10,
  },
  matchingRow: {
    gap: 8,
  },
  matchingLabelInput: {
    width: '100%',
  },
  switchRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  switchLabel: {
    flex: 1,
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    color: '#252525',
  },
  addQuestionBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FF7A45',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  addQuestionText: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 18,
    color: '#FFFFFF',
  },
  saveBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#76113A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  saveBtnText: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 18,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
  },
  modalTitle: {
    fontFamily: 'Roboto',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 20,
    color: '#252525',
    marginBottom: 12,
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  modalOptionText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 18,
    color: '#252525',
  },
  modalCloseBtn: {
    marginTop: 8,
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalCloseText: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 16,
    color: '#76113A',
  },
});
