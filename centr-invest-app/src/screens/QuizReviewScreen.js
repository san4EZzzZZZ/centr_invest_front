import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from '../components/SilentTouchables';
import { SafeAreaView } from 'react-native-safe-area-context';
import { attemptsApi } from '../api/client';

function buildFallbackTopics(result) {
  if (Array.isArray(result?.weakTopics) && result.weakTopics.length > 0) {
    return result.weakTopics.map((topic) => ({
      topic,
      recommendation: result?.recommendation || 'Повтори тему и реши несколько похожих вопросов для закрепления.',
      diagnosis: '',
    }));
  }

  return [
    {
      topic: 'Общий результат',
      recommendation: result?.recommendation || 'Тест завершен. Повтори ключевые темы и попробуй пройти его еще раз.',
      diagnosis: '',
    },
  ];
}

export default function QuizReviewScreen({ result, attemptId, onGoHome }) {
  const [review, setReview] = useState(result?.aiReview ?? null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  const reviewAttemptId = result?.attemptId ?? attemptId;
  const topics = Array.isArray(review?.topics) && review.topics.length > 0 ? review.topics : buildFallbackTopics(result);
  const resources = Array.isArray(review?.resources) ? review.resources : [];

  useEffect(() => {
    let ignore = false;

    async function loadReview() {
      if (!reviewAttemptId || result?.aiReview) return;

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
  }, [reviewAttemptId, result?.aiReview]);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>Рекомендации</Text>

          {isReviewLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator color="#8C1144" />
              <Text style={styles.loadingText}>Готовим персональный разбор...</Text>
            </View>
          ) : null}

          {!isReviewLoading && review?.summary ? <Text style={styles.summary}>{review.summary}</Text> : null}

          {!isReviewLoading && topics.map((item, index) => (
            <View key={`${item.topic}_${index}`} style={styles.topicBlock}>
              <Text style={styles.topicTitle}>{item.topic || 'Тема без названия'}</Text>
              <Text style={styles.topicText}>
                {item.recommendation || item.diagnosis || 'Повтори эту тему и вернись к тесту после практики.'}
              </Text>
            </View>
          ))}

          {!isReviewLoading && review?.nextStep ? (
            <View style={styles.topicBlock}>
              <Text style={styles.topicTitle}>Следующий шаг</Text>
              <Text style={styles.topicText}>{review.nextStep}</Text>
            </View>
          ) : null}

          {!isReviewLoading && resources.length > 0 ? (
            <View style={styles.topicBlock}>
              <Text style={styles.topicTitle}>Полезные материалы</Text>
              {resources.map((resource, index) => (
                <Text
                  key={`${resource.url}_${index}`}
                  style={styles.linkText}
                  onPress={() => resource?.url && Linking.openURL(resource.url)}
                >
                  {resource.title || resource.url}
                </Text>
              ))}
            </View>
          ) : null}

          {!isReviewLoading && reviewError ? <Text style={styles.errorText}>{reviewError}</Text> : null}
        </ScrollView>

        <TouchableOpacity onPress={onGoHome} activeOpacity={0.9} style={styles.homeBtn}>
          <Text style={styles.homeBtnText}>На главную</Text>
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
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 16,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  heading: {
    fontFamily: 'Roboto_500Medium',
    fontSize: 20,
    lineHeight: 24,
    color: '#3A3A3A',
  },
  centerState: {
    paddingTop: 28,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 20,
    color: '#A9A9A9',
    textAlign: 'center',
  },
  summary: {
    marginTop: 20,
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 22,
    color: '#A9A9A9',
  },
  topicBlock: {
    marginTop: 18,
  },
  topicTitle: {
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
    lineHeight: 20,
    color: '#3A3A3A',
  },
  topicText: {
    marginTop: 8,
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 22,
    color: '#A9A9A9',
  },
  linkText: {
    marginTop: 8,
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 22,
    color: '#8C1144',
  },
  errorText: {
    marginTop: 20,
    fontFamily: 'Roboto_400Regular',
    fontSize: 15,
    lineHeight: 20,
    color: '#C72E33',
  },
  homeBtn: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#8C1144',
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
