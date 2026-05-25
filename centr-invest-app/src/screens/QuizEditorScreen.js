import React, { useEffect, useMemo, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, View } from "react-native";
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
    text: '',
    options: (question.options ?? []).slice(0, 3).map((option) => ({ ...option, label: '' })),
    answer: type === 'text' ? '' : question.answer,
    showExplanation: type === 'singleReveal',
  };
}

function getTypeLabelFromValue(type) {
  return QUESTION_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? getQuestionTypeLabel(type);
}

function optionLabel(question, optionId) {
  return question.options?.find((option) => option.id === optionId)?.label ?? 'Выберите вариант';
}

const LANGUAGE_OPTIONS = [
  { id: 1, title: 'Python', icon: 'https://img.icons8.com/color/96/python--v1.png' },
  { id: 2, title: 'Java', icon: 'https://img.icons8.com/color/96/java-coffee-cup-logo.png' },
  { id: 3, title: 'C++', icon: 'https://img.icons8.com/color/96/c-plus-plus-logo.png' },
  { id: 4, title: 'C#', icon: 'https://img.icons8.com/color/96/c-sharp-logo.png' },
  { id: 5, title: 'SQL', icon: 'https://img.icons8.com/color/96/mysql-logo.png' },
  { id: 6, title: 'PHP', icon: 'https://img.icons8.com/color/96/elephant.png' },
  { id: 7, title: 'JS', icon: require('../../assets/js.jpg') },
  { id: 8, title: 'GO', icon: 'https://img.icons8.com/color/96/golang.png' },
];

function getImageSource(source) {
  return typeof source === 'string' ? { uri: source } : source;
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
    return {
      ...createQuizTemplate(''),
      questions: [createNewQuestion('single', 1)],
    };
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

export default function QuizEditorScreen({ quiz, languages = [], onCancel, onSave }) {
  const [draftQuiz, setDraftQuiz] = useState(() => createInitialDraft(quiz));
  const [typePickerForQuestion, setTypePickerForQuestion] = useState(null);
  const [answerPicker, setAnswerPicker] = useState(null);
  const [pickedTypeQuestionIds, setPickedTypeQuestionIds] = useState(() => new Set());
  const [selectedLanguageId, setSelectedLanguageId] = useState(() => {
    const quizLanguageId = Number(quiz?.languageId ?? quiz?.professionId);
    return Number.isFinite(quizLanguageId) && quizLanguageId > 0 ? quizLanguageId : LANGUAGE_OPTIONS[0].id;
  });

  const languageOptions = useMemo(() => {
    const source = Array.isArray(languages) && languages.length ? languages : LANGUAGE_OPTIONS;
    return source.map((language, index) => ({
      id: Number(language.id ?? language.languageId ?? LANGUAGE_OPTIONS[index]?.id ?? index + 1),
      title: language.title ?? language.languageTitle ?? LANGUAGE_OPTIONS[index]?.title ?? 'Язык',
      icon: language.icon ?? LANGUAGE_OPTIONS.find((item) => item.title === language.title)?.icon,
    }));
  }, [languages]);

  useEffect(() => {
    const nextDraft = createInitialDraft(quiz);
    setDraftQuiz(nextDraft);
    setTypePickerForQuestion(null);
    setPickedTypeQuestionIds(new Set(quiz ? (nextDraft.questions ?? []).map((question) => question.id) : []));
    const quizLanguageId = Number(quiz?.languageId ?? quiz?.professionId);
    setSelectedLanguageId(Number.isFinite(quizLanguageId) && quizLanguageId > 0 ? quizLanguageId : languageOptions[0]?.id ?? LANGUAGE_OPTIONS[0].id);
  }, [languageOptions, quiz]);

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
        label: '',
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
    const selectedLanguage = languageOptions.find((language) => language.id === selectedLanguageId);

    return {
      ...quizDraft,
      languageId: selectedLanguageId,
      professionId: selectedLanguageId,
      languageTitle: selectedLanguage?.title ?? quizDraft.languageTitle,
      professionTitle: selectedLanguage?.title ?? quizDraft.professionTitle,
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
        <Text style={styles.label}>Язык</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.languageList}
        >
          {languageOptions.map((language) => {
            const isSelected = selectedLanguageId === language.id;

            return (
              <TouchableOpacity
                key={language.id}
                activeOpacity={0.88}
                onPress={() => setSelectedLanguageId(language.id)}
                style={[styles.languageCard, isSelected ? styles.languageCardActive : null]}
              >
                <Image source={getImageSource(language.icon)} style={styles.languageIcon} resizeMode="contain" />
                <Text numberOfLines={1} style={styles.languageTitle}>{language.title}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={[styles.label, styles.titleLabel]}>Название</Text>
        <TextInput
          value={draftQuiz.title ?? ''}
          onChangeText={(value) => updateQuizField('title', value)}
          placeholder="Python Junior"
          placeholderTextColor="#D2D2D2"
          style={styles.input}
        />

        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>Вопросы</Text>
        </View>

        {(draftQuiz.questions ?? []).map((question, index) => (
          <View key={question.id} style={styles.card}>
            {index > 0 ? (
              <View style={styles.questionHeader}>
                <Text style={styles.questionIndex}>Вопрос {index + 1}</Text>
                <TouchableOpacity  onPress={() => removeQuestion(question.id)} style={styles.removeQuestionBtn} activeOpacity={0.8}>
                  <Feather name="trash-2" size={16} color="#D83131" />
                </TouchableOpacity>
              </View>
            ) : null}

            <Text style={styles.label}>Тип вопроса</Text>
            <View style={[styles.selectWrap, typePickerForQuestion === question.id ? styles.selectWrapOpen : null]}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.selectBox}
                onPress={() => setTypePickerForQuestion(typePickerForQuestion === question.id ? null : question.id)}
              >
                <Text style={[styles.selectText, !pickedTypeQuestionIds.has(question.id) || typePickerForQuestion === question.id ? styles.placeholderText : null]}>
                  {!pickedTypeQuestionIds.has(question.id) || typePickerForQuestion === question.id
                    ? 'Тип вопроса'
                    : getTypeLabelFromValue(question.type === 'singleReveal' ? 'single' : question.type)}
                </Text>
                <Feather name={typePickerForQuestion === question.id ? 'chevron-up' : 'chevron-down'} size={16} color="#7C7C7C" />
              </TouchableOpacity>

              {typePickerForQuestion === question.id ? (
                <View style={styles.typeMenu}>
                  {QUESTION_TYPE_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={styles.typeMenuOption}
                      onPress={() => {
                        updateQuestionType(question.id, option.value);
                        setPickedTypeQuestionIds((prev) => new Set(prev).add(question.id));
                        setTypePickerForQuestion(null);
                      }}
                    >
                      <Text style={styles.typeMenuText}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
            ) : null}
            </View>

            {pickedTypeQuestionIds.has(question.id) ? (
              <>
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
                              containerStyle={styles.optionInputWrap}
                              style={[styles.optionInput, isSelected ? styles.optionInputActive : null]}
                            />

                            <TouchableOpacity 
                              activeOpacity={0.85}
                              style={[styles.correctBtn, isSelected ? styles.correctBtnActive : null]}
                              onPress={() => (isMulti ? toggleMultiCorrect(question.id, option.id) : pickSingleCorrect(question.id, option.id))}
                            >
                              <Ionicons
                                name="checkmark"
                                size={22}
                                color="#252525"
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
              </>
            ) : null}

          </View>
        ))}

      </ScrollView>

      <View style={styles.footerActions}>
        <TouchableOpacity  style={styles.addQuestionBtn} onPress={addQuestion} activeOpacity={0.9}>
          <Feather name="plus" size={18} color="#FF5D2E" />
          <Text style={styles.addQuestionText}>Добавить вопрос</Text>
        </TouchableOpacity>

        <TouchableOpacity  style={styles.saveBtn} onPress={handleSave} activeOpacity={0.9}>
          <Text style={styles.saveBtnText}>Завершить</Text>
        </TouchableOpacity>
      </View>

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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
  },
  backBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Roboto',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 20,
    color: '#252525',
    textAlign: 'left',
    marginLeft: 4,
  },
  headerRight: {
    width: 28,
    height: 28,
  },
  content: {
    paddingHorizontal: 26,
    paddingBottom: 86,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    padding: 0,
    marginBottom: 0,
  },
  label: {
    fontFamily: 'Roboto',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 17,
    color: '#252525',
    marginBottom: 8,
    marginTop: 10,
  },
  titleLabel: {
    marginTop: 10,
    marginBottom: 16,
  },
  languageList: {
    gap: 14,
    paddingBottom: 6,
    paddingRight: 8,
  },
  languageCard: {
    width: 112,
    height: 88,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EAEBED',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  languageCardActive: {
    borderColor: '#50E45C',
  },
  languageIcon: {
    width: 38,
    height: 38,
  },
  languageTitle: {
    maxWidth: 56,
    fontFamily: 'Roboto',
    fontWeight: '700',
    fontSize: 17,
    lineHeight: 21,
    color: '#252525',
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#EAEBED',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 17,
    color: '#252525',
    backgroundColor: '#FFFFFF',
  },
  sectionTitleWrap: {
    paddingHorizontal: 0,
    marginBottom: 0,
    marginTop: 12,
  },
  sectionTitle: {
    fontFamily: 'Roboto',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 19,
    color: '#252525',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionIndex: {
    fontFamily: 'Roboto',
    fontWeight: '400',
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
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  selectWrap: {
    borderWidth: 1,
    borderColor: '#EAEBED',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  selectWrapOpen: {
    borderColor: '#FF6E4A',
  },
  selectText: {
    flex: 1,
    marginRight: 10,
    fontFamily: 'Roboto',
    fontSize: 12,
    lineHeight: 16,
    color: '#252525',
  },
  placeholderText: {
    color: '#D2D2D2',
  },
  typeMenu: {
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  typeMenuOption: {
    minHeight: 31,
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#D9D9D9',
  },
  typeMenuText: {
    fontFamily: 'Roboto',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 15,
    color: '#666666',
  },
  optionList: {
    gap: 11,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  optionInput: {
    width: '100%',
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#EAEBED',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Roboto',
    fontSize: 13,
    lineHeight: 17,
    color: '#252525',
    backgroundColor: '#FFFFFF',
  },
  optionInputWrap: {
    flex: 1,
    minWidth: 0,
  },
  optionInputActive: {
    borderColor: '#50E45C',
  },
  correctBtn: {
    width: 44,
    height: 44,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#EAEBED',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  correctBtnActive: {
    borderColor: '#50E45C',
    backgroundColor: '#FFFFFF',
  },
  deleteOptionBtn: {
    width: 20,
    height: 44,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  addAnswerBtn: {
    marginTop: 4,
    height: 28,
    borderRadius: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  addAnswerText: {
    fontFamily: 'Roboto',
    fontWeight: '400',
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
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    color: '#252525',
  },
  addQuestionBtn: {
    flexShrink: 0,
    height: 40,
    borderRadius: 0,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 0,
  },
  addQuestionText: {
    fontFamily: 'Roboto',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    color: '#FF5D2E',
  },
  saveBtn: {
    width: 150,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#76113A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveBtnText: {
    fontFamily: 'Roboto',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 18,
    color: '#FFFFFF',
  },
  footerActions: {
    borderTopWidth: 1,
    borderTopColor: '#F4F4F4',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
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
    fontWeight: '400',
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
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 16,
    color: '#76113A',
  },
});
