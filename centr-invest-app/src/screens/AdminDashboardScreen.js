import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity, TextInput } from "../components/SilentTouchables";
import { Feather, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

function QuizCard({ quiz, onEdit, onDelete }) {
  const isDraft = quiz.status === 'draft';

  return (
    <View style={styles.quizCard}>
      <View style={styles.quizCardTop}>
        <View style={styles.quizIcon} />
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
        <TouchableOpacity  onPress={onEdit} activeOpacity={0.8} style={styles.actionBtn}>
          <Feather name="edit-3" size={16} color="#9A7B00" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={onDelete}
          activeOpacity={0.8}
          style={[styles.actionBtn, styles.deleteBtn]}
        >
          <Feather name="trash-2" size={16} color="#D83131" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AdminDashboardScreen({ quizzes, onBack, onCreate, onEdit, onDelete }) {
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity  onPress={onBack} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color="#252525" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Тесты</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Тесты</Text>

          <View style={styles.list}>
            {quizzes.map((quiz) => (
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Создание</Text>

          <TouchableOpacity  style={styles.createCard} onPress={onCreate} activeOpacity={0.9}>
            <View style={styles.createIcon}>
              <Feather name="plus" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.createBody}>
              <Text style={styles.createTitle}>Создать новый тест</Text>
              <Text style={styles.createSubtitle}>Добавьте вопросы, ответы и пояснения</Text>
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
  section: {
    marginBottom: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
  },
  sectionTitle: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 20,
    color: '#252525',
    marginBottom: 14,
  },
  list: {
    gap: 12,
  },
  quizCard: {
    backgroundColor: '#FFFEEE',
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
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  deleteBtn: {
    borderColor: '#FFD6D6',
  },
  createCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0EB',
    borderRadius: 16,
    padding: 14,
  },
  createIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FF7A45',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  createBody: {
    flex: 1,
  },
  createTitle: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 16,
    color: '#252525',
  },
  createSubtitle: {
    marginTop: 4,
    fontFamily: 'Roboto',
    fontWeight: '400',
    fontSize: 11,
    lineHeight: 14,
    color: '#8A8983',
  },
});
