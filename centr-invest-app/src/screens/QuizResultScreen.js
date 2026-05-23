import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { attemptsApi } from '../api/client';

export default function QuizResultScreen({ quizTitle, result, attemptId, onGoHome }) {
  const [review, setReview] = useState(null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  const safeScore = typeof result?.correctAnswers === 'number' ? result.correctAnswers : 0;
  const safeTotal = typeof result?.totalQuestions === 'number' ? result.totalQuestions : 0;
  const title = result?.testTitle || quizTitle || 'Тест';
  const reviewAttemptId = result?.attemptId ?? attemptId;

  useEffect(() => {
    let ignore = false;

    async function loadReview() {
      if (!reviewAttemptId) return;

      setIsReviewLoading(true);
      setReviewError(null);

      try {
        const response = await attemptsApi.aiReview(reviewAttemptId);
        if (!ignore) setReview(response);
      } catch (error) {
        if (!ignore) setReviewError(error.message || 'Не удалось загрузить разбор');
      } finally {
        if (!ignore) setIsReviewLoading(false);
      }
    }

    loadReview();

    return () => {
      ignore = true;
    };
  }, [reviewAttemptId]);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.decor}>
          <Ionicons name="star-outline" size={22} color="#FF7A45" style={[styles.star, { top: 10, left: 30 }]} />
          <Ionicons name="star-outline" size={16} color="#FF7A45" style={[styles.star, { top: 48, right: 44 }]} />
          <Ionicons name="star-outline" size={14} color="#FF7A45" style={[styles.star, { top: 92, left: 10 }]} />
          <Ionicons name="star-outline" size={18} color="#FF7A45" style={[styles.star, { top: 104, right: 10 }]} />
          <Ionicons name="star-outline" size={14} color="#FF7A45" style={[styles.star, { top: 170, left: 60 }]} />
          <Ionicons name="star-outline" size={20} color="#FF7A45" style={[styles.star, { top: 180, right: 70 }]} />
        </View>

        <View style={styles.badgeOuter}>
          <View style={styles.badgeMid}>
            <View style={styles.badgeInner}>
              <Image source={require('../../assets/icon.png')} style={styles.badgeImage} />
            </View>
          </View>
        </View>

        <Text style={styles.recordLabel}>Твой результат</Text>
        <Text style={styles.recordValue}>
          {safeScore}/{safeTotal}
        </Text>

        <Text style={styles.congrats}>{title}</Text>
        <Text style={styles.subtitle}>{result?.recommendation || 'Тест завершен'}</Text>

        {result?.weakTopics?.length ? <Text style={styles.weakTopics}>Повторить: {result.weakTopics.join(', ')}</Text> : null}

        <View style={styles.reviewCard}>
          {isReviewLoading ? (
            <>
              <ActivityIndicator color="#7A1136" />
              <Text style={styles.reviewText}>Готовим персональный разбор...</Text>
            </>
          ) : review ? (
            <>
              <Text style={styles.reviewTitle}>{review.generatedByAi ? 'AI-разбор' : 'Разбор'}</Text>
              <Text style={styles.reviewText}>{review.summary}</Text>
              {review.nextStep ? <Text style={styles.reviewText}>{review.nextStep}</Text> : null}
            </>
          ) : reviewError ? (
            <Text style={styles.reviewText}>{reviewError}</Text>
          ) : null}
        </View>

        <View style={styles.bottom}>
          <TouchableOpacity onPress={onGoHome} activeOpacity={0.9} style={styles.homeBtn}>
            <Text style={styles.homeBtnText}>На главную</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 104,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decor: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    height: 220,
  },
  star: {
    position: 'absolute',
  },
  badgeOuter: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#FF7A45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeMid: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FF7A45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#FFF3D8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badgeImage: {
    width: 78,
    height: 78,
    borderRadius: 39,
    resizeMode: 'cover',
  },
  recordLabel: {
    marginTop: 18,
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 16,
    color: '#252525',
  },
  recordValue: {
    marginTop: 8,
    fontFamily: 'Roboto_500Medium',
    fontSize: 28,
    lineHeight: 28,
    color: '#7A1136',
  },
  congrats: {
    marginTop: 14,
    fontFamily: 'Roboto_500Medium',
    fontSize: 26,
    lineHeight: 30,
    color: '#7A1136',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 14,
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: '#8A8983',
    textAlign: 'center',
    maxWidth: 320,
  },
  weakTopics: {
    marginTop: 12,
    fontFamily: 'Roboto_500Medium',
    fontSize: 13,
    lineHeight: 18,
    color: '#FF5D2E',
    textAlign: 'center',
    maxWidth: 320,
  },
  reviewCard: {
    marginTop: 24,
    width: '100%',
    maxWidth: 340,
    minHeight: 78,
    borderRadius: 16,
    backgroundColor: '#FFFEEE',
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewTitle: {
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
    lineHeight: 20,
    color: '#7A1136',
  },
  reviewText: {
    marginTop: 8,
    fontFamily: 'Roboto_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: '#252525',
    textAlign: 'center',
  },
  bottom: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
  },
  homeBtn: {
    height: 56,
    borderRadius: 14,
    backgroundColor: '#7A1136',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtnText: {
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
    lineHeight: 16,
    color: '#FFFFFF',
  },
});
