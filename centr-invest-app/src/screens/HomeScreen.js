import React from 'react';
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 16);

  return (
    <SafeAreaView style={styles.screen}>
      {/* ГЛАВНЫЙ КОНТЕЙНЕР (Без горизонтального padding) */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 72 + bottomInset + 16 }]}
      >
        
        {/* HEADER (Отступ px-5 задаем внутри) */}
        <View style={styles.header}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.headerTitle}>Привет, User</Text>
            <Text style={styles.headerSubtitle}>Готов учиться</Text>
          </View>
        </View>

        {/* SEARCH BAR (px-5) */}
        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <Feather name="search" size={20} color="#7C7C7C" />
            <TextInput 
              placeholder="Поиск теста"
              placeholderTextColor="#7C7C7C"
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* --- СЕКЦИЯ ПРОФЕССИИ (Edge-to-Edge Scroll) --- */}
        <View style={styles.section}>
          {/* Заголовок с отступом 16 */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Профессии</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>Смотреть все</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.horizontalListWrap}>
          {/* Сам скролл БЕЗ внешнего padding */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.horizontalListContent}
          >
            {[1, 2, 3, 4].map((item) => (
              <View 
                key={item} 
                style={styles.professionCard}
              />
            ))}
          </ScrollView>
          </View>
        </View>

        {/* СЕКЦИЯ НЕДАВНИЕ (px-5) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Недавние</Text>
          </View>
          <View style={styles.recentList}>
            <RecentCard 
              title="Python Junior" 
              questions="12 вопросов" 
              status="Пройдено" 
              statusVariant="passed"
              iconColor="#FDE68A"
            />
            <RecentCard 
              title="Java developer" 
              questions="12 вопросов" 
              status="Пройдено" 
              statusVariant="passed"
              iconColor="#FDE68A"
            />
            <RecentCard 
              title="Java Senior" 
              questions="12 вопросов" 
              status="Не пройдено" 
              statusVariant="not_passed"
              iconColor="#D17E7E"
            />
          </View>
        </View>
      </ScrollView>

    {/* --- ОБНОВЛЕННЫЙ BOTTOM NAVIGATION --- */}
        <View pointerEvents="box-none" style={[styles.bottomNavContainer, { paddingBottom: bottomInset }]}>
            <View style={styles.bottomNav}>
            {/* Кнопка Домой (Активная) */}
            <TouchableOpacity style={styles.bottomNavBtn}>
                <Ionicons name="home" size={28} color="#7A1136" />
            </TouchableOpacity>

            {/* Кнопка Избранное */}
            <TouchableOpacity style={styles.bottomNavBtn}>
                <Ionicons name="heart-outline" size={30} color="#D1D1D1" />
            </TouchableOpacity>

            {/* Кнопка Профиль */}
            <TouchableOpacity style={styles.bottomNavBtn}>
                <Ionicons name="person-outline" size={30} color="#D1D1D1" />
            </TouchableOpacity>
            </View>
        </View>
    </SafeAreaView>
  );
}

// Компонент карточки
function RecentCard({ title, questions, status, statusVariant, iconColor }) {
  const isPassed = statusVariant === 'passed';
  return (
    <View style={styles.recentCard}>
      <View style={styles.recentLeft}>
        <View style={[styles.recentIcon, { backgroundColor: iconColor }]} />
        <View>
          <Text style={styles.recentTitle}>{title}</Text>
          <Text style={styles.recentQuestions}>{questions}</Text>
        </View>
      </View>
      <View style={[styles.statusPill, isPassed ? styles.statusPillPassed : styles.statusPillNotPassed]}>
        <Text
          numberOfLines={1}
          style={[styles.statusText, isPassed ? styles.statusTextPassed : styles.statusTextNotPassed]}
        >
          {status}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: 120, // перезаписывается динамически с учетом safe-area
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  headerTitle: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 14,
    color: '#252525',
  },
  headerSubtitle: {
    marginTop: 6,
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 12,
    color: '#8A8983',
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAEAEA',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 12,
    color: '#252525',
  },
  section: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 14,
    color: '#252525',
  },
  sectionAction: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 14,
    color: '#76113A',
  },
  horizontalListWrap: {
    paddingBottom: 16,
  },
  horizontalListContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  professionCard: {
    width: 130,
    height: 100,
    backgroundColor: '#D9D9D9',
    borderRadius: 16,
  },
  recentList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  recentCard: {
    backgroundColor: '#FFFEEE',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  recentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 16,
  },
  recentTitle: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 12,
    color: '#252525',
  },
  recentQuestions: {
    marginTop: 6,
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 10,
    lineHeight: 10,
    color: '#8A8983',
  },
  statusPill: {
    height: 18,
    minWidth: 69,
    borderRadius: 6,
    paddingTop: 2,
    paddingRight: 6,
    paddingBottom: 2,
    paddingLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusPillPassed: {
    backgroundColor: '#D8EFE3',
  },
  statusPillNotPassed: {
    backgroundColor: '#FFEE8F',
  },
  statusText: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 12,
  },
  statusTextPassed: {
    color: '#26A144',
  },
  statusTextNotPassed: {
    color: '#FFA600',
  },
  bottomNavContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F5F5F5',
  },
  bottomNav: {
    marginHorizontal: 16,
    height: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    // Тень для объема
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  bottomNavBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
