import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import QuizScreen from './QuizScreen';
import QuizResultScreen from './QuizResultScreen';
import { QUIZZES } from '../data/quizzes';

const PROFILE_DATA = {
  name: 'Admin',
  email: 'yourmail@mail.com',
  role: 'Администратор',
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom;
  const NAV_HEIGHT = 64;

  const [route, setRoute] = useState({ name: 'home' });

  const quizzesByTitle = useMemo(() => {
    const map = new Map();
    for (const q of QUIZZES) map.set(q.title, q);
    return map;
  }, []);

  if (route.name === 'quiz') {
    return (
      <QuizScreen
        quiz={route.quiz}
        onBack={() => setRoute({ name: 'home' })}
        onFinish={({ quiz, score, total }) => setRoute({ name: 'result', quiz, score, total })}
      />
    );
  }

  if (route.name === 'result') {
    return (
      <QuizResultScreen
        quizTitle={route.quiz?.title}
        score={route.score}
        total={route.total}
        onGoHome={() => setRoute({ name: 'home' })}
        onReview={() => setRoute({ name: 'home' })}
      />
    );
  }

  if (route.name === 'profile') {
    return (
      <ProfileScreen
        bottomInset={bottomInset}
        navHeight={NAV_HEIGHT}
        onGoHome={() => setRoute({ name: 'home' })}
        onOpenProfile={() => setRoute({ name: 'profile' })}
      />
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, styles.homeScreen]}>
      {/* ГЛАВНЫЙ КОНТЕЙНЕР (Без горизонтального padding) */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: NAV_HEIGHT + bottomInset + 24 }]}
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
              title="Смешанный тест" 
              questions="12 вопросов" 
              status="Новый" 
              statusVariant="not_passed"
              iconColor="#FFB58F"
              onPress={() => setRoute({ name: 'quiz', quiz: quizzesByTitle.get('Java Senior') ?? QUIZZES[0] })}
            />
            <RecentCard 
              title="Python Junior" 
              questions="12 вопросов" 
              status="Пройдено" 
              statusVariant="passed"
              iconColor="#FDE68A"
              onPress={() => setRoute({ name: 'quiz', quiz: quizzesByTitle.get('Python Junior') ?? QUIZZES[0] })}
            />
            <RecentCard 
              title="Java Senior" 
              questions="12 вопросов" 
              status="Не пройдено" 
              statusVariant="not_passed"
              iconColor="#D17E7E"
              onPress={() => setRoute({ name: 'quiz', quiz: quizzesByTitle.get('Java Senior') ?? QUIZZES[0] })}
            />
          </View>
        </View>
      </ScrollView>

    {/* --- ОБНОВЛЕННЫЙ BOTTOM NAVIGATION --- */}
        <BottomNav
          bottomInset={bottomInset}
          navHeight={NAV_HEIGHT}
          activeTab="home"
          onGoHome={() => setRoute({ name: 'home' })}
          onOpenProfile={() => setRoute({ name: 'profile' })}
        />
    </SafeAreaView>
  );
}

function ProfileScreen({ bottomInset, navHeight, onGoHome, onOpenProfile }) {
  return (
    <SafeAreaView edges={['top']} style={[styles.screen, styles.profileScreen]}>
      <View style={styles.profileShell}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.profileScrollContent, { paddingBottom: navHeight + bottomInset + 24 }]}
        >
          <Text style={styles.profileTitle}>Профиль</Text>

          <View style={styles.profileCard}>
            <View style={styles.avatarFrame}>
              <Image source={require('../../assets/icon.png')} style={styles.avatarImage} />
            </View>

            <ProfileField label="Имя пользователя" value={PROFILE_DATA.name} />
            <ProfileField label="Email" value={PROFILE_DATA.email} />
            <ProfileField label="Должность" value={PROFILE_DATA.role} />

            <TouchableOpacity activeOpacity={0.85} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Выйти</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <BottomNav
        bottomInset={bottomInset}
        navHeight={navHeight}
        activeTab="profile"
        onGoHome={onGoHome}
        onOpenProfile={onOpenProfile}
      />
    </SafeAreaView>
  );
}

function ProfileField({ label, value }) {
  return (
    <View style={styles.profileField}>
      <Text style={styles.profileFieldLabel}>{label}</Text>
      <Text style={styles.profileFieldValue}>{value}</Text>
    </View>
  );
}

function BottomNav({ bottomInset, navHeight, activeTab, onGoHome, onOpenProfile }) {
  return (
    <View pointerEvents="box-none" style={styles.bottomNavContainer}>
      <View style={styles.bottomNavShadow}>
        <View style={[styles.bottomNav, { height: navHeight + bottomInset, paddingBottom: bottomInset }]}>
          <TouchableOpacity style={styles.bottomNavBtn} onPress={onGoHome} activeOpacity={0.8}>
            <Ionicons name="home" size={28} color={activeTab === 'home' ? '#7A1136' : '#D1D1D1'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomNavBtn} activeOpacity={0.8}>
            <Ionicons name="heart-outline" size={30} color="#D1D1D1" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomNavBtn} onPress={onOpenProfile} activeOpacity={0.8}>
            <Ionicons name="person-outline" size={30} color={activeTab === 'profile' ? '#7A1136' : '#D1D1D1'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomNavBtn} activeOpacity={0.8}>
            <Ionicons name="add" size={32} color="#D1D1D1" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Компонент карточки
function RecentCard({ title, questions, status, statusVariant, iconColor, onPress }) {
  const isPassed = statusVariant === 'passed';
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.recentCard}>
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  homeScreen: {
    backgroundColor: '#F5F5F5',
  },
  profileScreen: {
    backgroundColor: '#6B6B6B',
  },
  scrollContent: {
    paddingBottom: 120, // перезаписывается динамически с учетом safe-area
  },
  profileShell: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 0,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  profileScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    alignItems: 'center',
  },
  profileTitle: {
    fontFamily: 'Roboto',
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 26,
    color: '#252525',
    marginBottom: 24,
    textAlign: 'center',
  },
  profileCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE7FF',
    backgroundColor: '#FFFFFF',
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#F1EFFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 3,
  },
  avatarFrame: {
    width: 92,
    height: 92,
    borderRadius: 46,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginBottom: 18,
    backgroundColor: '#F4F4F4',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileField: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileFieldLabel: {
    fontFamily: 'Roboto',
    fontWeight: '400',
    fontSize: 18,
    lineHeight: 22,
    color: '#595959',
    marginBottom: 6,
    textAlign: 'center',
  },
  profileFieldValue: {
    fontFamily: 'Roboto',
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 22,
    color: '#111111',
    textAlign: 'center',
  },
  logoutBtn: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  logoutText: {
    fontFamily: 'Roboto',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 20,
    color: '#FF5D2E',
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
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  bottomNav: {
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  bottomNavShadow: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    // Тень для объема (на внешнем контейнере, чтобы не было "квадратных углов" у контента)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  bottomNavBtn: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
