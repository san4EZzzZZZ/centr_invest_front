<<<<<<< Updated upstream
import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import QuizScreen from './QuizScreen';
import QuizResultScreen from './QuizResultScreen';
import { QUIZZES } from '../data/quizzes';

export default function HomeScreen() {
=======
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import QuizScreen from './QuizScreen';
import QuizResultScreen from './QuizResultScreen';
import AdminDashboardScreen from './AdminDashboardScreen';
import QuizEditorScreen from './QuizEditorScreen';
import { adminApi, contentApi, profileApi } from '../api/client';

const FALLBACK_ICON = 'https://img.icons8.com/color/96/source-code.png';
const DEFAULT_READ_MORE_URL = 'https://developer.mozilla.org/';

function toEditorQuiz(test) {
  if (!test) return null;

  return {
    id: test.id,
    professionId: test.professionId,
    professionTitle: test.professionTitle,
    title: test.title,
    shortDescription: test.shortDescription,
    description: test.description,
    status: 'published',
    questions: (test.questions ?? []).map((question) => {
      const base = {
        id: String(question.id),
        topic: question.topic,
        text: question.prompt,
        explanation: question.explanation,
        sourceUrl: question.readMoreUrl,
      };

      if (question.type === 'MULTIPLE_CHOICE') {
        return {
          ...base,
          type: 'multi',
          options: (question.options ?? []).map((option) => ({ id: String(option.id), label: option.text })),
          correctOptionIds: (question.options ?? []).filter((option) => option.correct).map((option) => String(option.id)),
        };
      }

      if (question.type === 'MATCHING') {
        const options = (question.matchPairs ?? []).map((pair, index) => ({
          id: `pair_${pair.id}_${index}`,
          label: pair.rightLabel,
        }));

        return {
          ...base,
          type: 'matching',
          options,
          rows: (question.matchPairs ?? []).map((pair, index) => ({
            id: `row_${pair.id}_${index}`,
            label: pair.leftLabel,
            options,
            correctOptionId: `pair_${pair.id}_${index}`,
          })),
        };
      }

      if (question.type === 'SHORT_TEXT') {
        return { ...base, type: 'text', answer: question.correctTextAnswer ?? '' };
      }

      return {
        ...base,
        type: 'single',
        showExplanation: true,
        options: (question.options ?? []).map((option) => ({ id: String(option.id), label: option.text })),
        correctOptionId: String((question.options ?? []).find((option) => option.correct)?.id ?? question.options?.[0]?.id ?? ''),
      };
    }),
  };
}

function ensureTwoOptions(options) {
  const next = [...(options ?? [])];
  while (next.length < 2) {
    next.push({ id: `generated_${next.length + 1}`, label: `Вариант ${next.length + 1}` });
  }
  return next;
}

function getOptionLabel(options, optionId) {
  return options?.find((option) => option.id === optionId)?.label ?? options?.[0]?.label ?? 'Вариант';
}

function toAdminPayload(quiz, fallbackProfessionId) {
  const professionId = Number(quiz.professionId ?? fallbackProfessionId);
  const title = String(quiz.title || '').trim() || 'Новый тест';
  const shortDescription = String(quiz.shortDescription || '').trim() || title;
  const description = String(quiz.description || '').trim() || shortDescription;

  return {
    professionId,
    title,
    shortDescription,
    description,
    questions: (quiz.questions ?? []).map((question, index) => {
      const topic = String(question.topic || '').trim() || 'General';
      const prompt = String(question.text || '').trim() || `Вопрос ${index + 1}`;
      const explanation = String(question.explanation || '').trim() || 'Пояснение будет добавлено позже.';
      const readMoreUrl = String(question.sourceUrl || '').trim() || DEFAULT_READ_MORE_URL;

      if (question.type === 'multi') {
        const options = ensureTwoOptions(question.options);
        const correctIds = question.correctOptionIds?.length ? question.correctOptionIds : [options[0]?.id].filter(Boolean);
        return {
          type: 'MULTIPLE_CHOICE',
          topic,
          prompt,
          correctTextAnswer: null,
          explanation,
          readMoreUrl,
          options: options.map((option, optionIndex) => ({
            text: String(option.label || '').trim() || `Вариант ${optionIndex + 1}`,
            correct: correctIds.includes(option.id),
          })),
          matchPairs: [],
        };
      }

      if (question.type === 'matching') {
        const options = question.options ?? [];
        const rows = question.rows?.length ? question.rows : [{ label: 'Левая часть', correctOptionId: options[0]?.id }];
        return {
          type: 'MATCHING',
          topic,
          prompt,
          correctTextAnswer: null,
          explanation,
          readMoreUrl,
          options: [],
          matchPairs: rows.map((row, rowIndex) => ({
            leftLabel: String(row.label || '').trim() || `Элемент ${rowIndex + 1}`,
            rightLabel: getOptionLabel(options, row.correctOptionId),
          })),
        };
      }

      if (question.type === 'text') {
        return {
          type: 'SHORT_TEXT',
          topic,
          prompt,
          correctTextAnswer: String(question.answer || '').trim() || 'ответ',
          explanation,
          readMoreUrl,
          options: [],
          matchPairs: [],
        };
      }

      const options = ensureTwoOptions(question.options);
      const correctOptionId = question.correctOptionId ?? options[0]?.id;
      return {
        type: 'SINGLE_CHOICE',
        topic,
        prompt,
        correctTextAnswer: null,
        explanation,
        readMoreUrl,
        options: options.map((option, optionIndex) => ({
          text: String(option.label || '').trim() || `Вариант ${optionIndex + 1}`,
          correct: option.id === correctOptionId,
        })),
        matchPairs: [],
      };
    }),
  };
}

export default function HomeScreen({ currentUser, onLogout }) {
>>>>>>> Stashed changes
  const insets = useSafeAreaInsets();
  const NAV_HEIGHT = 64;
  const NAV_SIDE = 0;

  const [route, setRoute] = useState({ name: 'home' });
  const [professions, setProfessions] = useState([]);
  const [allProfessions, setAllProfessions] = useState([]);
  const [tests, setTests] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [profile, setProfile] = useState(null);
  const [adminTests, setAdminTests] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const homeRequestId = useRef(0);

<<<<<<< Updated upstream
  const quizzesByTitle = useMemo(() => {
    const map = new Map();
    for (const q of QUIZZES) map.set(q.title, q);
    return map;
  }, []);
=======
  const isAdmin = currentUser?.roleCode === 'ADMIN' || currentUser?.role === 'Администратор';

  async function loadHomeData(query = search) {
    const requestId = homeRequestId.current + 1;
    homeRequestId.current = requestId;
    setIsLoading(true);
    setError(null);

    try {
      const [professionsResponse, profileResponse] = await Promise.all([
        contentApi.getProfessions({ title: query }),
        profileApi.get().catch(() => null),
      ]);

      const nextProfessions = Array.isArray(professionsResponse) ? professionsResponse : [];
      const nextTests = nextProfessions.flatMap((profession) =>
        (profession.tests ?? []).map((test) => ({
          ...test,
          professionId: profession.id,
          professionTitle: profession.title,
          status: 'published',
        }))
      );

      if (requestId !== homeRequestId.current) return;

      setProfessions(nextProfessions);
      if (!query) {
        setAllProfessions(nextProfessions);
      }
      setTests(nextTests);
      setProfile(profileResponse);
      setFavorites(profileResponse?.favoriteTests ?? []);
    } catch (loadError) {
      if (requestId === homeRequestId.current) {
        setError(loadError.message || 'Не удалось загрузить данные');
      }
    } finally {
      if (requestId === homeRequestId.current) {
        setIsLoading(false);
      }
    }
  }

  async function loadAdminTests() {
    if (!isAdmin) return;

    try {
      const response = await adminApi.getTests();
      setAdminTests(Array.isArray(response) ? response : []);
    } catch (loadError) {
      Alert.alert('Ошибка', loadError.message || 'Не удалось загрузить админские тесты');
    }
  }

  function goHomeWithRefresh() {
    setSearch('');
    loadHomeData('');
    setRoute({ name: 'home' });
  }

  useEffect(() => {
    loadHomeData('');
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadHomeData(search);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    if (route.name === 'admin') {
      loadAdminTests();
    }
  }, [route.name]);

  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.testId)), [favorites]);
  const displayUser = profile?.user
    ? { ...currentUser, email: profile.user.email, name: profile.user.username }
    : currentUser;

  async function toggleFavorite(test) {
    try {
      if (favoriteIds.has(test.id)) {
        await profileApi.removeFavorite(test.id);
      } else {
        await profileApi.addFavorite(test.id);
      }
      const nextProfile = await profileApi.get();
      setProfile(nextProfile);
      setFavorites(nextProfile?.favoriteTests ?? []);
    } catch (favoriteError) {
      Alert.alert('Ошибка', favoriteError.message || 'Не удалось обновить избранное');
    }
  }
>>>>>>> Stashed changes

  if (route.name === 'quiz') {
    return (
      <QuizScreen
        quiz={route.quiz}
        onBack={goHomeWithRefresh}
        onFinish={({ quiz, result, attemptId }) => setRoute({ name: 'result', quiz, result, attemptId })}
      />
    );
  }

  if (route.name === 'result') {
    return (
      <QuizResultScreen
        quizTitle={route.quiz?.title}
        result={route.result}
        attemptId={route.attemptId}
        onGoHome={() => {
          goHomeWithRefresh();
        }}
      />
    );
  }

<<<<<<< Updated upstream
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
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
=======
  if (route.name === 'admin') {
    return (
      <AdminDashboardScreen
        quizzes={adminTests}
        onBack={goHomeWithRefresh}
        onCreate={() => setRoute({ name: 'editor', quiz: null })}
        onEdit={async (quiz) => {
          try {
            const details = await adminApi.getTest(quiz.id);
            setRoute({ name: 'editor', quiz: toEditorQuiz(details) });
          } catch (editError) {
            Alert.alert('Ошибка', editError.message || 'Не удалось открыть тест');
          }
        }}
        onDelete={async (quizId) => {
          await adminApi.deleteTest(quizId);
          setAdminTests((prev) => prev.filter((quiz) => quiz.id !== quizId));
          await loadHomeData('');
        }}
      />
    );
  }

  if (route.name === 'editor') {
    return (
      <QuizEditorScreen
        quiz={route.quiz}
        onCancel={() => setRoute({ name: 'admin' })}
        onSave={async (nextQuiz) => {
          try {
            const fallbackProfessionId = route.quiz?.professionId ?? allProfessions[0]?.id ?? professions[0]?.id;
            if (!fallbackProfessionId) {
              Alert.alert('Ошибка', 'Сначала нужна хотя бы одна профессия на сервере');
              return;
            }

            const payload = toAdminPayload(nextQuiz, fallbackProfessionId);
            if (route.quiz?.id) {
              await adminApi.updateTest(route.quiz.id, payload);
            } else {
              await adminApi.createTest(payload);
            }
            await loadAdminTests();
            await loadHomeData('');
            setRoute({ name: 'admin' });
          } catch (saveError) {
            Alert.alert('Ошибка', saveError.message || 'Не удалось сохранить тест');
          }
        }}
      />
    );
  }

  if (route.name === 'profile') {
    return (
      <Shell bottomInset={insets.bottom} navHeight={NAV_HEIGHT} activeTab="profile" isAdmin={isAdmin} setRoute={setRoute} onGoHome={goHomeWithRefresh}>
        <View style={styles.profileCard}>
          <Image source={require('../../assets/icon.png')} style={styles.profileAvatar} />
          <ProfileField label="Имя пользователя" value={displayUser?.name ?? 'Пользователь'} />
          <ProfileField label="Email" value={displayUser?.email ?? 'unknown@mail.com'} />
          <ProfileField label="Роль" value={displayUser?.role ?? 'Пользователь'} />
          <TouchableOpacity activeOpacity={0.85} style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutText}>Выйти</Text>
          </TouchableOpacity>
        </View>
      </Shell>
    );
  }

  if (route.name === 'favorites') {
    return (
      <Shell bottomInset={insets.bottom} navHeight={NAV_HEIGHT} activeTab="favorites" isAdmin={isAdmin} setRoute={setRoute} onGoHome={goHomeWithRefresh}>
        <HeaderTitle title="Избранное" />
        <View style={styles.list}>
          {favorites.length ? (
            favorites.map((item) => (
              <TestCard
                key={item.testId}
                title={item.testTitle}
                description={item.testShortDescription || item.testDescription}
                meta={item.professionTitle}
                favorite
                onFavorite={() => toggleFavorite({ id: item.testId })}
                onPress={() => setRoute({ name: 'quiz', quiz: { id: item.testId, title: item.testTitle } })}
              />
            ))
          ) : (
            <Text style={styles.mutedText}>В избранном пока пусто</Text>
          )}
        </View>
      </Shell>
    );
  }

  return (
    <Shell bottomInset={insets.bottom} navHeight={NAV_HEIGHT} activeTab="home" isAdmin={isAdmin} setRoute={setRoute} onGoHome={goHomeWithRefresh}>
      <View style={styles.header}>
        <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} style={styles.avatar} />
        <View>
          <Text style={styles.headerTitle}>Привет, {displayUser?.name ?? 'User'}</Text>
          <Text style={styles.headerSubtitle}>Готов учиться</Text>
>>>>>>> Stashed changes
        </View>
      </View>

<<<<<<< Updated upstream
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
              onPress={() => setRoute({ name: 'quiz', quiz: quizzesByTitle.get('Python Junior') ?? QUIZZES[0] })}
            />
            <RecentCard 
              title="Java developer" 
              questions="12 вопросов" 
              status="Пройдено" 
              statusVariant="passed"
              iconColor="#FDE68A"
              onPress={() => setRoute({ name: 'quiz', quiz: quizzesByTitle.get('Java Senior') ?? QUIZZES[0] })}
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
        <View
          pointerEvents="box-none"
          style={[styles.bottomNavContainer, { paddingHorizontal: NAV_SIDE }]}
        >
            <View style={styles.bottomNavShadow}>
              <View style={[styles.bottomNav, { height: NAV_HEIGHT + bottomInset, paddingBottom: bottomInset }]}>
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
        </View>
    </SafeAreaView>
  );
}

// Компонент карточки
function RecentCard({ title, questions, status, statusVariant, iconColor, onPress }) {
  const isPassed = statusVariant === 'passed';
=======
      <View style={styles.searchBar}>
        <Feather name="search" size={20} color="#7C7C7C" />
        <TextInput
          placeholder="Поиск теста"
          placeholderTextColor="#7C7C7C"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => loadHomeData(search)}
          style={styles.searchInput}
        />
      </View>

      <SectionTitle title="Профессии" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.professionList}>
        {professions.map((profession) => (
          <View key={profession.id} style={styles.professionCard}>
            <Image source={{ uri: FALLBACK_ICON }} style={styles.professionIcon} />
            <Text numberOfLines={2} style={styles.professionName}>{profession.title}</Text>
          </View>
        ))}
      </ScrollView>

      <SectionTitle title="Тесты" />
      {isLoading ? (
        <View style={styles.centerRow}>
          <ActivityIndicator color="#7A1136" />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.list}>
          {tests.length ? (
            tests.map((test, index) => (
              <TestCard
                key={test.id}
                title={test.title}
                description={test.shortDescription || test.description}
                meta={`${test.questionCount ?? 0} вопросов · ${test.professionTitle ?? 'Профессия'}`}
                iconColor={index % 2 === 0 ? '#FFB58F' : '#FDE68A'}
                favorite={favoriteIds.has(test.id)}
                onFavorite={() => toggleFavorite(test)}
                onPress={() => setRoute({ name: 'quiz', quiz: test })}
              />
            ))
          ) : (
            <Text style={styles.mutedText}>Тесты не найдены</Text>
          )}
        </View>
      )}
    </Shell>
  );
}

function Shell({ children, bottomInset, navHeight, activeTab, isAdmin, setRoute, onGoHome }) {
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: navHeight + bottomInset + 24 }]}>
        {children}
      </ScrollView>
      <BottomNav
        bottomInset={bottomInset}
        navHeight={navHeight}
        activeTab={activeTab}
        isAdmin={isAdmin}
        onGoHome={onGoHome}
        onOpenFavorites={() => setRoute({ name: 'favorites' })}
        onOpenProfile={() => setRoute({ name: 'profile' })}
        onOpenAdmin={() => setRoute({ name: 'admin' })}
      />
    </SafeAreaView>
  );
}

function HeaderTitle({ title }) {
  return <Text style={styles.pageTitle}>{title}</Text>;
}

function SectionTitle({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function ProfileField({ label, value }) {
  return (
    <View style={styles.profileField}>
      <Text style={styles.profileFieldLabel}>{label}</Text>
      <Text style={styles.profileFieldValue}>{value}</Text>
    </View>
  );
}

function TestCard({ title, description, meta, iconColor = '#FDE68A', favorite, onFavorite, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.testCard}>
      <View style={[styles.testIcon, { backgroundColor: iconColor }]} />
      <View style={styles.testBody}>
        <Text numberOfLines={1} style={styles.testTitle}>{title}</Text>
        {description ? <Text numberOfLines={2} style={styles.testDescription}>{description}</Text> : null}
        <Text numberOfLines={1} style={styles.testMeta}>{meta}</Text>
      </View>
      <TouchableOpacity onPress={onFavorite} hitSlop={10} style={styles.favoriteBtn}>
        <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={24} color={favorite ? '#76113A' : '#CECECE'} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function BottomNav({ bottomInset, navHeight, activeTab, onGoHome, onOpenFavorites, onOpenProfile, onOpenAdmin, isAdmin }) {
>>>>>>> Stashed changes
  return (
    <View style={styles.bottomNavContainer}>
      <View style={[styles.bottomNav, { height: navHeight + bottomInset, paddingBottom: bottomInset }]}>
        <TouchableOpacity style={styles.bottomNavBtn} onPress={onGoHome}>
          <Ionicons name="home" size={28} color={activeTab === 'home' ? '#76113A' : '#CECECE'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavBtn} onPress={onOpenFavorites}>
          <Ionicons name={activeTab === 'favorites' ? 'heart' : 'heart-outline'} size={30} color={activeTab === 'favorites' ? '#76113A' : '#CECECE'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavBtn} onPress={onOpenProfile}>
          <Ionicons name={activeTab === 'profile' ? 'person' : 'person-outline'} size={30} color={activeTab === 'profile' ? '#76113A' : '#CECECE'} />
        </TouchableOpacity>
        {isAdmin ? (
          <TouchableOpacity style={styles.bottomNavBtn} onPress={onOpenAdmin}>
            <Ionicons name="add" size={32} color="#76113A" />
          </TouchableOpacity>
        ) : null}
      </View>
<<<<<<< Updated upstream
      <View style={[styles.statusPill, isPassed ? styles.statusPillPassed : styles.statusPillNotPassed]}>
        <Text
          numberOfLines={1}
          style={[styles.statusText, isPassed ? styles.statusTextPassed : styles.statusTextNotPassed]}
        >
          {status}
        </Text>
      </View>
    </TouchableOpacity>
=======
    </View>
>>>>>>> Stashed changes
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
<<<<<<< Updated upstream
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: 120, // перезаписывается динамически с учетом safe-area
=======
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
>>>>>>> Stashed changes
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    lineHeight: 14,
    color: '#8A8983',
  },
<<<<<<< Updated upstream
  searchWrap: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
=======
>>>>>>> Stashed changes
  searchBar: {
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EAEAEA',
    flexDirection: 'row',
    alignItems: 'center',
<<<<<<< Updated upstream
    backgroundColor: '#EAEAEA',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
=======
    paddingHorizontal: 10,
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
  pageTitle: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 22,
    lineHeight: 28,
    color: '#252525',
    marginBottom: 18,
  },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 14,
    fontFamily: 'Roboto_500Medium',
    fontSize: 15,
    lineHeight: 18,
    color: '#252525',
  },
  professionList: {
    gap: 12,
>>>>>>> Stashed changes
  },
  professionCard: {
    width: 130,
    height: 100,
<<<<<<< Updated upstream
    backgroundColor: '#D9D9D9',
    borderRadius: 16,
=======
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F2F2F2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  professionIcon: {
    width: 42,
    height: 42,
    marginRight: 10,
  },
  professionName: {
    flex: 1,
    fontFamily: 'Roboto_700Bold',
    fontSize: 17,
    lineHeight: 20,
    color: '#252525',
>>>>>>> Stashed changes
  },
  list: {
    gap: 14,
  },
  testCard: {
    minHeight: 82,
    borderRadius: 16,
    backgroundColor: '#FFFEEE',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  testIcon: {
    width: 48,
    height: 48,
<<<<<<< Updated upstream
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
=======
    borderRadius: 8,
    marginRight: 14,
  },
  testBody: {
    flex: 1,
    paddingRight: 10,
  },
  testTitle: {
    fontFamily: 'Roboto_500Medium',
    fontSize: 13,
    lineHeight: 16,
    color: '#252525',
  },
  testDescription: {
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
    fontSize: 11,
    lineHeight: 14,
    color: '#8A8983',
  },
  testMeta: {
    marginTop: 5,
    fontFamily: 'Roboto_500Medium',
    fontSize: 11,
    lineHeight: 14,
    color: '#76113A',
>>>>>>> Stashed changes
  },
  favoriteBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerRow: {
    paddingVertical: 20,
  },
<<<<<<< Updated upstream
=======
  mutedText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: '#8A8983',
  },
  errorText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: '#F23030',
  },
  profileCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE7FF',
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  profileAvatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    marginBottom: 18,
  },
  profileField: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileFieldLabel: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 20,
    color: '#595959',
    marginBottom: 6,
  },
  profileFieldValue: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 16,
    lineHeight: 20,
    color: '#111111',
    textAlign: 'center',
  },
  logoutBtn: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  logoutText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 20,
    color: '#FF5D2E',
  },
>>>>>>> Stashed changes
  bottomNavContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  bottomNav: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
<<<<<<< Updated upstream
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
=======
    gap: 50,
    shadowColor: '#F2EFFF',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
>>>>>>> Stashed changes
  },
  bottomNavBtn: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
