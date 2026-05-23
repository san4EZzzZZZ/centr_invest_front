import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import QuizScreen from './QuizScreen';
import QuizResultScreen from './QuizResultScreen';
import AdminDashboardScreen from './AdminDashboardScreen';
import QuizEditorScreen from './QuizEditorScreen';

const SEARCH_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.5 16C7.68333 16 6.146 15.3707 4.888 14.112C3.63 12.8533 3.00067 11.316 3 9.5C2.99933 7.684 3.62867 6.14667 4.888 4.888C6.14733 3.62933 7.68467 3 9.5 3C11.3153 3 12.853 3.62933 14.113 4.888C15.373 6.14667 16.002 7.684 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L20.3 18.9C20.4833 19.0833 20.575 19.3167 20.575 19.6C20.575 19.8833 20.4833 20.1167 20.3 20.3C20.1167 20.4833 19.8833 20.575 19.6 20.575C19.3167 20.575 19.0833 20.4833 18.9 20.3L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16ZM9.5 14C10.75 14 11.8127 13.5627 12.688 12.688C13.5633 11.8133 14.0007 10.7507 14 9.5C13.9993 8.24933 13.562 7.187 12.688 6.313C11.814 5.439 10.7513 5.00133 9.5 5C8.24867 4.99867 7.18633 5.43633 6.313 6.313C5.43967 7.18967 5.002 8.252 5 9.5C4.998 10.748 5.43567 11.8107 6.313 12.688C7.19033 13.5653 8.25267 14.0027 9.5 14Z" fill="#7C7C7C"/>
</svg>`;

export default function HomeScreen({ currentUser, quizzes, setQuizzes, onLogout }) {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom;
  const NAV_HEIGHT = 64;

  const [route, setRoute] = useState({ name: 'home' });

  const visibleQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => quiz.status !== 'draft');
  }, [quizzes]);

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

  if (route.name === 'admin') {
    return (
      <AdminDashboardScreen
        quizzes={quizzes}
        onBack={() => setRoute({ name: 'home' })}
        onCreate={() => setRoute({ name: 'editor', quiz: null })}
        onEdit={(quiz) => setRoute({ name: 'editor', quiz })}
        onDelete={(quizId) => setQuizzes((prev) => prev.filter((quiz) => quiz.id !== quizId))}
      />
    );
  }

  if (route.name === 'editor') {
    return (
      <QuizEditorScreen
        quiz={route.quiz}
        onCancel={() => setRoute({ name: 'admin' })}
        onSave={(nextQuiz) => {
          setQuizzes((prev) => {
            const exists = prev.some((quiz) => quiz.id === nextQuiz.id);
            if (exists) return prev.map((quiz) => (quiz.id === nextQuiz.id ? nextQuiz : quiz));
            return [nextQuiz, ...prev];
          });
          setRoute({ name: 'admin' });
        }}
      />
    );
  }

  if (route.name === 'profile') {
    return (
      <ProfileScreen
        currentUser={currentUser}
        bottomInset={bottomInset}
        navHeight={NAV_HEIGHT}
        onGoHome={() => setRoute({ name: 'home' })}
        onOpenProfile={() => setRoute({ name: 'profile' })}
        onLogout={onLogout}
      />
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, styles.homeScreen]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: NAV_HEIGHT + bottomInset + 24 }]}
      >
        <View style={styles.header}>
          <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} style={styles.avatar} />
          <View>
            <Text style={styles.headerTitle}>Привет, {currentUser?.name ?? 'User'}</Text>
            <Text style={styles.headerSubtitle}>Готов учиться</Text>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <SvgXml xml={SEARCH_SVG} width="24" height="24" />
            <TextInput placeholder="Поиск теста" placeholderTextColor="#7C7C7C" style={styles.searchInput} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Профессии</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>Смотреть все</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.horizontalListWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalListContent}>
              {[1, 2, 3, 4].map((item) => (
                <View key={item} style={styles.professionCard} />
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Недавние</Text>
          </View>
          <View style={styles.recentList}>
            {visibleQuizzes.slice(0, 3).map((quiz, index) => (
              <RecentCard
                key={quiz.id}
                title={quiz.title}
                questions={`${quiz.questions?.length ?? 0} вопросов`}
                status={quiz.status === 'draft' ? 'Черновик' : index === 0 ? 'Новый' : 'Опубликован'}
                statusVariant={quiz.status === 'draft' ? 'draft' : index === 0 ? 'not_passed' : 'passed'}
                iconColor={index === 0 ? '#FFB58F' : index === 1 ? '#FDE68A' : '#D17E7E'}
                onPress={() => setRoute({ name: 'quiz', quiz })}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomNav
        bottomInset={bottomInset}
        navHeight={NAV_HEIGHT}
        activeTab="home"
        onGoHome={() => setRoute({ name: 'home' })}
        onOpenProfile={() => setRoute({ name: 'profile' })}
        onOpenAdmin={() => {
          if (currentUser?.role === 'Администратор') setRoute({ name: 'admin' });
        }}
        isAdmin={currentUser?.role === 'Администратор'}
      />
    </SafeAreaView>
  );
}

function ProfileScreen({ currentUser, bottomInset, navHeight, onGoHome, onOpenProfile, onLogout }) {
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

            <ProfileField label="Имя пользователя" value={currentUser?.name ?? 'Пользователь'} />
            <ProfileField label="Email" value={currentUser?.email ?? 'unknown@mail.com'} />
            <ProfileField label="Должность" value={currentUser?.role ?? 'Пользователь'} />

            <TouchableOpacity activeOpacity={0.85} style={styles.logoutBtn} onPress={onLogout}>
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
        onOpenAdmin={() => {}}
        isAdmin={false}
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

function BottomNav({ bottomInset, navHeight, activeTab, onGoHome, onOpenProfile, onOpenAdmin, isAdmin }) {
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

          {isAdmin ? (
            <TouchableOpacity style={styles.bottomNavBtn} onPress={onOpenAdmin} activeOpacity={0.8}>
              <Ionicons name="add" size={32} color="#7A1136" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function RecentCard({ title, questions, status, statusVariant, iconColor, onPress }) {
  const isPassed = statusVariant === 'passed';
  const isDraft = statusVariant === 'draft';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.recentCard}>
      <View style={styles.recentLeft}>
        <View style={[styles.recentIcon, { backgroundColor: iconColor }]} />
        <View>
          <Text style={styles.recentTitle}>{title}</Text>
          <Text style={styles.recentQuestions}>{questions}</Text>
        </View>
      </View>
      <View
        style={[
          styles.statusPill,
          isDraft ? styles.statusPillDraft : isPassed ? styles.statusPillPassed : styles.statusPillNotPassed,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.statusText,
            isDraft ? styles.statusTextDraft : isPassed ? styles.statusTextPassed : styles.statusTextNotPassed,
          ]}
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
    backgroundColor: '#FFFFFF',
  },
  profileScreen: {
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 120,
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
    borderWidth: 2,
    borderColor: '#E6E3C3',
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
    borderWidth: 2,
    borderColor: '#E6E3C3',
  },
  headerTitle: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 20,
    color: '#252525',
  },
  headerSubtitle: {
    marginTop: 2,
    fontFamily: 'Roboto_500Medium',
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
    paddingHorizontal: 8,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    color: '#252525',
    paddingVertical: 0,
    textAlignVertical: 'center',
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
  statusPillDraft: {
    backgroundColor: '#EFE7FF',
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
  statusTextDraft: {
    color: '#7A1136',
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
