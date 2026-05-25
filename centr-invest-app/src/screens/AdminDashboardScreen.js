import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, Image } from "react-native";
import { TouchableOpacity, TextInput } from "../components/SilentTouchables";
import { Feather, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

function QuizCard({ quiz, onEdit, onDelete, onPublish }) {
  const isDraft = quiz.published === false;

  return (
    <View style={styles.quizCard}>
      <View style={styles.quizCardTop}>
        <View style={[styles.quizIcon, { backgroundColor: quiz.icon ? 'transparent' : '#F5D76A', alignItems: 'center', justifyContent: 'center' }]}>
          {quiz.icon ? (
            <Image source={{ uri: quiz.icon }} style={{ width: 28, height: 28 }} resizeMode="contain" />
          ) : null}
        </View>
        <View style={styles.quizCardBody}>
          <Text style={styles.quizTitle} numberOfLines={1}>
            {quiz.title}
          </Text>
          <Text style={styles.quizSubtitle}>{quiz.questionCount ?? quiz.questions?.length ?? 0} вопросов</Text>
        </View>

        <View style={[styles.statusPill, isDraft ? styles.statusPillDraft : styles.statusPillPublished]}>
          <Text style={[styles.statusText, isDraft ? styles.statusTextDraft : styles.statusTextPublished]}>
            {isDraft ? 'Черновик' : 'Опубликован'}
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        {isDraft && (
          <TouchableOpacity
            onPress={onPublish}
            activeOpacity={0.8}
            style={[styles.actionBtn, styles.publishBtn]}
          >
            <Feather name="archive" size={16} color="#27AE60" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onEdit}
          activeOpacity={0.8}
          style={[styles.actionBtn, styles.editBtnDraft]}
        >
          <Feather name="edit-3" size={16} color="#E2B93B" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={onDelete}
          activeOpacity={0.8}
          style={[styles.actionBtn, styles.deleteBtn]}
        >
          <Feather name="trash-2" size={16} color="#EB5757" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AdminDashboardScreen({ quizzes = [], onBack, onCreate, onEdit, onDelete, onPublish, bottomInset = 0, navHeight = 64 }) {
  const publishedQuizzes = quizzes.filter(q => q.published);
  const draftQuizzes = quizzes.filter(q => !q.published);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity  onPress={onBack} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color="#252525" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Тесты</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: navHeight + bottomInset + 24 }]}>
        {publishedQuizzes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Опубликованные</Text>
            <View style={styles.list}>
              {publishedQuizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onEdit={() => onEdit?.(quiz)}
                  onDelete={() => {
                    Alert.alert('Удалить тест?', `Тест "${quiz.title}" будет удален без возможности восстановления.`, [
                      { text: 'Отмена', style: 'cancel' },
                      {
                        text: 'Удалить',
                        style: 'destructive',
                        onPress: () => {
                          Promise.resolve(onDelete?.(quiz.id)).catch((deleteError) => {
                            Alert.alert('Ошибка', deleteError?.message || 'Не удалось удалить тест');
                          });
                        },
                      },
                    ]);
                  }}
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Черновики</Text>

          <View style={styles.list}>
            {draftQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onPublish={() => onPublish?.(quiz.id)}
                onEdit={() => onEdit?.(quiz)}
                onDelete={() => {
                  Alert.alert('Удалить черновик?', `Тест "${quiz.title}" будет удален.`, [
                    { text: 'Отмена', style: 'cancel' },
                    {
                      text: 'Удалить',
                      style: 'destructive',
                      onPress: () => {
                        Promise.resolve(onDelete?.(quiz.id)).catch((deleteError) => {
                          Alert.alert('Ошибка', deleteError?.message || 'Не удалось удалить тест');
                        });
                      },
                    },
                  ]);
                }}
              />
            ))}
          </View>

          <TouchableOpacity  style={styles.createCard} onPress={onCreate} activeOpacity={0.9}>
            <View style={styles.createIcon}>
              <Feather name="plus" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.createBody}>
              <Text style={styles.createTitle}>Создать новый тест</Text>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    paddingTop: 24,
    paddingBottom: 16,
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
    fontSize: 20,
    lineHeight: 23,
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
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 23,
    color: '#252525',
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  quizCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8EFE3',
    borderRadius: 16,
    padding: 12,
  },
  quizCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F5D76A',
    marginRight: 12,
  },
  quizCardBody: {
    flex: 1,
    paddingRight: 10,
  },
  quizTitle: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 15,
    color: '#252525',
  },
  quizSubtitle: {
    marginTop: 4,
    fontFamily: 'Roboto',
    fontWeight: '400',
    fontSize: 11,
    lineHeight: 13,
    color: '#8A8983',
  },
  statusPill: {
    minWidth: 72,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPillPublished: {
    backgroundColor: '#D8EFE3',
  },
  statusPillDraft: {
    backgroundColor: '#EFE7FF',
  },
  statusText: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 11,
    lineHeight: 13,
  },
  statusTextPublished: {
    color: '#26A144',
  },
  statusTextDraft: {
    color: '#7A1136',
  },
  actionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  publishBtn: {
    borderColor: '#D8EFE3',
    backgroundColor: '#F6FFF9',
  },
  editBtnDraft: {
    borderColor: '#FEF1D3',
    backgroundColor: '#FFFEF8',
  },
  deleteBtn: {
    borderColor: '#FFD6D6',
    backgroundColor: '#FFF9F9',
  },
  createCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#76113A',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
  },
  createIcon: {
    width: 18,
    height: 18,
    borderRadius: 10,
    backgroundColor: '#76113A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  createBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createTitle: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 16,
    color: '#FFFFFF',
    textAlign: "center",
  },
});
