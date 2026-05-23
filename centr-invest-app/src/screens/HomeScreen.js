import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
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

const HOME_ACTIVE_SVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M28 26.6664C28 27.02 27.8595 27.3592 27.6095 27.6092C27.3594 27.8593 27.0203 27.9997 26.6667 27.9997H5.33333C4.97971 27.9997 4.64057 27.8593 4.39052 27.6092C4.14048 27.3592 4 27.02 4 26.6664V12.6531C3.99986 12.4499 4.04616 12.2494 4.13535 12.0668C4.22455 11.8843 4.35429 11.7245 4.51467 11.5997L15.1813 3.30241C15.4154 3.12034 15.7035 3.02148 16 3.02148C16.2965 3.02148 16.5846 3.12034 16.8187 3.30241L27.4853 11.5997C27.6457 11.7245 27.7754 11.8843 27.8646 12.0668C27.9538 12.2494 28.0001 12.4499 28 12.6531V26.6664Z" fill="#76113A"/>
</svg>`;

const HOME_INACTIVE_SVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M28 26.6664C28 27.02 27.8595 27.3592 27.6095 27.6092C27.3594 27.8593 27.0203 27.9997 26.6667 27.9997H5.33333C4.97971 27.9997 4.64057 27.8593 4.39052 27.6092C4.14048 27.3592 4 27.02 4 26.6664V12.6531C3.99986 12.4499 4.04616 12.2494 4.13535 12.0668C4.22455 11.8843 4.35429 11.7245 4.51467 11.5997L15.1813 3.30241C15.4154 3.12034 15.7035 3.02148 16 3.02148C16.2965 3.02148 16.5846 3.12034 16.8187 3.30241L27.4853 11.5997C27.6457 11.7245 27.7754 11.8843 27.8646 12.0668C27.9538 12.2494 28.0001 12.4499 28 12.6531V26.6664Z" fill="#CECECE"/>
</svg>`;

const HEART_ACTIVE_SVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.0533 27.5466C15.32 27.8133 15.6533 27.9333 16 27.9333C16.3467 27.9333 16.68 27.7999 16.9467 27.5466L26.9467 17.5466C30.08 14.4133 30.08 9.47993 26.9467 6.33326C23.88 3.29326 19.1467 3.19993 16 6.0666C12.8533 3.19993 8.12 3.27993 5.05334 6.33326C1.92001 9.47993 1.92001 14.4133 5.05334 17.5466L15.0533 27.5466ZM6.94667 8.21326C8 7.17326 9.33334 6.65326 10.68 6.65326C12.0267 6.65326 13.36 7.17326 14.4 8.21326L15.0667 8.87993C15.5867 9.39993 16.4267 9.39993 16.9467 8.87993L17.6133 8.21326C19.6933 6.13326 22.9733 6.13326 25.0667 8.21326C27.1467 10.3066 27.1467 13.5733 25.0667 15.6533L16.0133 24.7066L6.96 15.6533C6.46575 15.168 6.07316 14.5891 5.80516 13.9504C5.53716 13.3116 5.39913 12.6259 5.39913 11.9333C5.39913 11.2406 5.53716 10.5549 5.80516 9.91617C6.07316 9.27745 6.46575 8.69854 6.96 8.21326H6.94667Z" fill="#76113A"/>
</svg>`;

const HEART_INACTIVE_SVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.0533 27.5466C15.32 27.8133 15.6533 27.9333 16 27.9333C16.3467 27.9333 16.68 27.7999 16.9467 27.5466L26.9467 17.5466C30.08 14.4133 30.08 9.47993 26.9467 6.33326C23.88 3.29326 19.1467 3.19993 16 6.0666C12.8533 3.19993 8.12 3.27993 5.05334 6.33326C1.92001 9.47993 1.92001 14.4133 5.05334 17.5466L15.0533 27.5466ZM6.94667 8.21326C8 7.17326 9.33334 6.65326 10.68 6.65326C12.0267 6.65326 13.36 7.17326 14.4 8.21326L15.0667 8.87993C15.5867 9.39993 16.4267 9.39993 16.9467 8.87993L17.6133 8.21326C19.6933 6.13326 22.9733 6.13326 25.0667 8.21326C27.1467 10.3066 27.1467 13.5733 25.0667 15.6533L16.0133 24.7066L6.96 15.6533C6.46575 15.168 6.07316 14.5891 5.80516 13.9504C5.53716 13.3116 5.39913 12.6259 5.39913 11.9333C5.39913 11.2406 5.53716 10.5549 5.80516 9.91617C6.07316 9.27745 6.46575 8.69854 6.96 8.21326H6.94667Z" fill="#CECECE"/>
</svg>`;

const PROFILE_ACTIVE_SVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 28V25.3333C8 23.9188 8.5619 22.5623 9.5621 21.5621C10.5623 20.5619 11.9188 20 13.3333 20H18.6667C20.0812 20 21.4377 20.5619 22.4379 21.5621C23.4381 22.5623 24 23.9188 24 25.3333V28M10.6667 9.33333C10.6667 10.7478 11.2286 12.1044 12.2288 13.1046C13.229 14.1048 14.5855 14.6667 16 14.6667C17.4145 14.6667 18.771 14.1048 19.7712 13.1046C20.7714 12.1044 21.3333 10.7478 21.3333 9.33333C21.3333 7.91885 20.7714 6.56229 19.7712 5.5621C18.771 4.5619 17.4145 4 16 4C14.5855 4 13.229 4.5619 12.2288 5.5621C11.2286 6.56229 10.6667 7.91885 10.6667 9.33333Z" stroke="#76113A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const PROFILE_INACTIVE_SVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 28V25.3333C8 23.9188 8.5619 22.5623 9.5621 21.5621C10.5623 20.5619 11.9188 20 13.3333 20H18.6667C20.0812 20 21.4377 20.5619 22.4379 21.5621C23.4381 22.5623 24 23.9188 24 25.3333V28M10.6667 9.33333C10.6667 10.7478 11.2286 12.1044 12.2288 13.1046C13.229 14.1048 14.5855 14.6667 16 14.6667C17.4145 14.6667 18.771 14.1048 19.7712 13.1046C20.7714 12.1044 21.3333 10.7478 21.3333 9.33333C21.3333 7.91885 20.7714 6.56229 19.7712 5.5621C18.771 4.5619 17.4145 4 16 4C14.5855 4 13.229 4.5619 12.2288 5.5621C11.2286 6.56229 10.6667 7.91885 10.6667 9.33333Z" stroke="#CECECE" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const PROFESSIONS = [
  { id: 1, title: 'PHP', icon: 'https://img.icons8.com/?size=96&id=JybIpZjjXT0F&format=png' },
  { id: 2, title: 'Java', icon: 'https://img.icons8.com/color/96/java-coffee-cup-logo.png' },
  { id: 3, title: 'Python', icon: 'https://img.icons8.com/color/96/python--v1.png' },
];

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
              {PROFESSIONS.map((item) => (
                <TouchableOpacity key={item.id} style={styles.professionCard} activeOpacity={0.8}>
                  <Image source={{ uri: item.icon }} style={styles.professionIcon} />
                  <Text style={styles.professionName}>{item.title}</Text>
                </TouchableOpacity>
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
                status={quiz.status === 'draft' ? 'Черновик' : index === 0 ? 'Пройдено' : 'Не пройдено'}
                statusVariant={quiz.status === 'draft' ? 'draft' : index === 0 ? 'passed' : 'not_passed'}
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
      <View style={styles.bottomNavShadowWrap}>
        {Platform.OS === 'android' && (
          <>
            <View pointerEvents="none" style={styles.androidShadowLeftSoft} />
            <View pointerEvents="none" style={styles.androidShadowLeft} />
            <View pointerEvents="none" style={styles.androidShadowRightSoft} />
            <View pointerEvents="none" style={styles.androidShadowRight} />
          </>
        )}
        <View style={styles.bottomNavShadow}>
          <View style={Platform.OS === 'ios' ? styles.bottomNavShadowInner : null}>
            <View style={[styles.bottomNav, { height: navHeight + bottomInset, paddingBottom: bottomInset }]}>
              <TouchableOpacity style={styles.bottomNavBtn} onPress={onGoHome} activeOpacity={0.8}>
                <SvgXml
                  xml={activeTab === 'home' ? HOME_ACTIVE_SVG : HOME_INACTIVE_SVG}
                  width="32"
                  height="32"
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.bottomNavBtn} activeOpacity={0.8}>
                <SvgXml
                  xml={activeTab === 'favorites' ? HEART_ACTIVE_SVG : HEART_INACTIVE_SVG}
                  width="32"
                  height="32"
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.bottomNavBtn} onPress={onOpenProfile} activeOpacity={0.8}>
                <SvgXml
                  xml={activeTab === 'profile' ? PROFILE_ACTIVE_SVG : PROFILE_INACTIVE_SVG}
                  width="32"
                  height="32"
                />
              </TouchableOpacity>

              {isAdmin ? (
                <TouchableOpacity style={styles.bottomNavBtn} onPress={onOpenAdmin} activeOpacity={0.8}>
                  <Ionicons name="add" size={32} color="#7A1136" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
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
    paddingBottom: 0,
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
    marginVertical: 16,
  },
  sectionTitle: {
    fontFamily: 'Roboto_500Medium',
    fontSize: 14,
    lineHeight: 14,
    color: '#252525',
  },
  sectionAction: {
    fontFamily: 'Roboto_500Medium',
    fontSize: 14,
    lineHeight: 14,
    color: '#76113A',
  },
  horizontalListWrap: {
    paddingBottom: 0,
  },
  horizontalListContent: {
    paddingHorizontal: 16,
    gap: 12, // Уменьшил зазор между карточками
  },
  professionCard: {
    width: 148,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F2F2F2',
    flexDirection: 'row',
    alignItems: 'center', // Вернул центрирование для надежности
    paddingLeft: 19.5,
    paddingRight: 4,
  },
  professionIcon: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
    marginRight: 10, // Немного увеличил отступ от иконки до текста
  },
  professionName: {
    fontFamily: 'Roboto_700Bold', // Попробую Bold, возможно Medium недостаточно жирный для Semibold
    fontSize: 20,
    color: '#252525',
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
    borderRadius: 6,
    marginRight: 16,
  },
  recentTitle: {
    fontFamily: 'Roboto_500Medium',
    fontSize: 12,
    lineHeight: 12,
    color: '#252525',
  },
  recentQuestions: {
    marginTop: 6,
    fontFamily: 'Roboto_500Medium',
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
    fontFamily: 'Roboto_500Medium',
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
  bottomNavShadowWrap: {
    width: '100%',
    position: 'relative',
    ...Platform.select({
      web: {
        boxShadow: '-6px 10px 14px 0px rgba(242, 239, 255, 0.45), 6px 10px 12px 0px rgba(242, 239, 255, 0.45)',
      },
    }),
  },
  bottomNavShadow: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#F2EFFF',
        shadowOffset: { width: -2, height: -3 },
        shadowOpacity: 1.0,
        shadowRadius: 3,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  bottomNavShadowInner: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#F2EFFF',
        shadowOffset: { width: 2, height: -3 },
        shadowOpacity: 1.0,
        shadowRadius: 3,
      },
      default: {},
    }),
  },
  androidShadowLeftSoft: {
    position: 'absolute',
    left: -4,
    top: -4,
    right: 0,
    bottom: 30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: 'rgba(242, 239, 255, 0.5)',
  },
  androidShadowLeft: {
    position: 'absolute',
    left: -2,
    top: -3,
    right: 0,
    bottom: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: 'rgba(242, 239, 255, 0.6)',
  },
  androidShadowRightSoft: {
    position: 'absolute',
    left: 4,
    top: -4,
    right: -4,
    bottom: 30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: 'rgba(242, 239, 255, 0.5)',
  },
  androidShadowRight: {
    position: 'absolute',
    left: 2,
    top: -3,
    right: -2,
    bottom: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: 'rgba(242, 239, 255, 0.6)',
  },
  bottomNavBtn: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
