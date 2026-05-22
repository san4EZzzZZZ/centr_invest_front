import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QuizScreen({ quiz, onBack, onFinish }) {
  const total = quiz?.questions?.length ?? 0;

  const [index, setIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [answersByQuestionId, setAnswersByQuestionId] = useState({});

  const question = quiz?.questions?.[index];
  const currentNumber = index + 1;
  const isLast = currentNumber >= total;
  const progress = total > 0 ? currentNumber / total : 0;

  const canContinue = Boolean(selectedOptionId);

  const scoreIfFinished = useMemo(() => {
    if (!quiz?.questions?.length) return 0;
    let score = 0;
    for (const q of quiz.questions) {
      const selected = answersByQuestionId[q.id];
      if (selected && q.correctOptionId && selected === q.correctOptionId) score += 1;
    }
    return score;
  }, [answersByQuestionId, quiz]);

  const handleNext = () => {
    if (!question || !selectedOptionId) return;

    const nextAnswers = { ...answersByQuestionId, [question.id]: selectedOptionId };
    setAnswersByQuestionId(nextAnswers);

    if (isLast) {
      const finalScore = (() => {
        let score = 0;
        for (const q of quiz.questions) {
          const selected = q.id === question.id ? selectedOptionId : nextAnswers[q.id];
          if (selected && q.correctOptionId && selected === q.correctOptionId) score += 1;
        }
        return score;
      })();

      onFinish?.({ quiz, score: finalScore, total });
      return;
    }

    setIndex((v) => Math.min(v + 1, total - 1));
    setSelectedOptionId(null);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color="#252525" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{quiz?.title ?? 'Тест'}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.questionLabel}>Вопрос</Text>
        <Text style={styles.counter}>
          {currentNumber}/{total}
        </Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{question?.text ?? ''}</Text>
        </View>

        <View style={styles.options}>
          {(question?.options ?? []).map((opt) => {
            const selected = opt.id === selectedOptionId;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setSelectedOptionId(opt.id)}
                activeOpacity={0.85}
                style={[styles.option, selected ? styles.optionSelected : null]}
              >
                <Text style={styles.optionText}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={!canContinue}
          activeOpacity={0.9}
          style={[styles.primaryBtn, !canContinue ? styles.primaryBtnDisabled : null]}
        >
          <Text style={styles.primaryBtnText}>{isLast ? 'Завершить' : 'Далее'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'left',
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 16,
    color: '#252525',
  },
  headerRight: {
    width: 32,
    height: 32,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  questionLabel: {
    marginTop: 8,
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 14,
    color: '#252525',
  },
  counter: {
    marginTop: 10,
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 28,
    lineHeight: 28,
    color: '#FF501A',
  },
  progressTrack: {
    marginTop: 14,
    height: 2,
    width: '100%',
    backgroundColor: '#E3E3E3',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7A1136',
  },
  questionCard: {
    marginTop: 18,
    backgroundColor: '#FF9B76',
    borderWidth: 2,
    borderColor: '#FF501A',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  questionText: {
    textAlign: 'center',
    fontFamily: 'Roboto',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 18,
    color: '#252525',
  },
  options: {
    marginTop: 18,
    gap: 12,
  },
  option: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: '#F6D2C3',
    borderWidth: 1.5,
    borderColor: '#FF501A',
  },
  optionText: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 14,
    color: '#252525',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 22,
    backgroundColor: '#FFFFFF',
  },
  primaryBtn: {
    height: 56,
    borderRadius: 14,
    backgroundColor: '#7A1136',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 16,
    color: '#FFFFFF',
  },
});

