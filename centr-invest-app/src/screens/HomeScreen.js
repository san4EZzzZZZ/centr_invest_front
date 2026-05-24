import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Keyboard, PanResponder, View, Text, ScrollView, Image, StyleSheet, Platform } from "react-native";
import { TouchableOpacity, TextInput } from "../components/SilentTouchables";
import { SvgXml } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import QuizScreen from './QuizScreen';
import QuizResultScreen from './QuizResultScreen';
import AdminDashboardScreen from './AdminDashboardScreen';
import QuizEditorScreen from './QuizEditorScreen';
import { adminApi, contentApi, profileApi } from '../api/client';

const SEARCH_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.5 16C7.68333 16 6.146 15.3707 4.888 14.112C3.63 12.8533 3.00067 11.316 3 9.5C2.99933 7.684 3.62867 6.14667 4.888 4.888C6.14733 3.62933 7.68467 3 9.5 3C11.3153 3 12.853 3.62933 14.113 4.888C15.373 6.14667 16.002 7.684 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L20.3 18.9C20.4833 19.0833 20.575 19.3167 20.575 19.6C20.575 19.8833 20.4833 20.1167 20.3 20.3C20.1167 20.4833 19.8833 20.575 19.6 20.575C19.3167 20.575 19.0833 20.4833 18.9 20.3L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16ZM9.5 14C10.75 14 11.8127 13.5627 12.688 12.688C13.5633 11.8133 14.0007 10.7507 14 9.5C13.9993 8.24933 13.562 7.187 12.688 6.313C11.814 5.439 10.7513 5.00133 9.5 5C8.24867 4.99867 7.18633 5.43633 6.313 6.313C5.43967 7.18967 5.002 8.252 5 9.5C4.998 10.748 5.43567 11.8107 6.313 12.688C7.19033 13.5653 8.25267 14.0027 9.5 14Z" fill="#7C7C7C"/>
</svg>`;

const HOME_NAV_SVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.1775 27.9999C6.60683 27.9999 5.3335 26.6932 5.3335 25.0799V13.3439C5.3335 12.4572 5.72683 11.6172 6.40016 11.0639L14.2228 4.63988C14.7226 4.22599 15.3512 3.99951 16.0002 3.99951C16.6491 3.99951 17.2777 4.22599 17.7775 4.63988L25.5988 11.0639C26.2735 11.6172 26.6668 12.4572 26.6668 13.3439V25.0799C26.6668 26.6932 25.3935 27.9999 23.8228 27.9999H8.1775Z" stroke="#CECECE" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12.667 28V20.6667C12.667 19.9594 12.9479 19.2811 13.448 18.781C13.9481 18.281 14.6264 18 15.3337 18H16.667C17.3742 18 18.0525 18.281 18.5526 18.781C19.0527 19.2811 19.3337 19.9594 19.3337 20.6667V28" stroke="#CECECE" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const PLUS_NAV_SVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M26.2857 17.7143H17.7143V26.2857C17.7143 26.7404 17.5337 27.1764 17.2122 27.4979C16.8907 27.8194 16.4547 28 16 28C15.5453 28 15.1093 27.8194 14.7878 27.4979C14.4663 27.1764 14.2857 26.7404 14.2857 26.2857V17.7143H5.71429C5.25963 17.7143 4.82359 17.5337 4.5021 17.2122C4.18061 16.8907 4 16.4547 4 16C4 15.5453 4.18061 15.1093 4.5021 14.7878C4.82359 14.4663 5.25963 14.2857 5.71429 14.2857H14.2857V5.71429C14.2857 5.25963 14.4663 4.82359 14.7878 4.5021C15.1093 4.18061 15.5453 4 16 4C16.4547 4 16.8907 4.18061 17.2122 4.5021C17.5337 4.82359 17.7143 5.25963 17.7143 5.71429V14.2857H26.2857C26.7404 14.2857 27.1764 14.4663 27.4979 14.7878C27.8194 15.1093 28 15.5453 28 16C28 16.4547 27.8194 16.8907 27.4979 17.2122C27.1764 17.5337 26.7404 17.7143 26.2857 17.7143Z" fill="#CECECE"/>
</svg>`;

const BIN_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19 8V19.6C19 20.2365 18.7471 20.847 18.2971 21.2971C17.847 21.7471 17.2365 22 16.6 22H7.4C6.76348 22 6.15303 21.7471 5.70294 21.2971C5.25286 20.847 5 20.2365 5 19.6V8M16 5V3.2C16 2.54 15.46 2 14.8 2H9.2C8.54 2 8 2.54 8 3.2V5M16 5H8M16 5H21M8 5H3M12 11V17M15 11V17M9 11V17" stroke="#E92828" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
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

const FALLBACK_ICON = 'https://img.icons8.com/color/96/source-code.png';
const DEFAULT_READ_MORE_URL = 'https://developer.mozilla.org/';

function toEditorQuiz(test) {
  if (!test) return null;

  return {
    id: test.id,
    languageId: test.languageId ?? test.professionId,
    languageTitle: test.languageTitle ?? test.professionTitle,
    professionId: test.languageId ?? test.professionId,
    professionTitle: test.languageTitle ?? test.professionTitle,
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

function toAdminPayload(quiz, fallbackLanguageId) {
  const languageId = Number(quiz.languageId ?? quiz.professionId ?? fallbackLanguageId);
  const title = String(quiz.title || '').trim() || 'Новый тест';
  const shortDescription = String(quiz.shortDescription || '').trim() || title;
  const description = String(quiz.description || '').trim() || shortDescription;

  return {
    languageId,
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
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom;
  const NAV_HEIGHT = 64;

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

  const isAdmin =
    currentUser?.roleCode === 'ADMIN' ||
    currentUser?.roleCode === 'SUPER_ADMIN' ||
    currentUser?.role === 'Администратор' ||
    currentUser?.role === 'Супер-администратор';

  const roleName = useMemo(() => {
    const userRoleCode = displayUser?.roleCode || currentUser?.roleCode;
    const userRole = displayUser?.role || currentUser?.role;

    if (userRoleCode === 'SUPER_ADMIN' || userRole === 'Супер-администратор') {
      return 'Администратор';
    }
    if (userRoleCode === 'ADMIN' || userRole === 'Администратор') {
      return 'Редактор';
    }
    return 'Ученик';
  }, [displayUser, currentUser]);

  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.testId)), [favorites]);
  const displayUser = profile?.user
    ? { ...currentUser, email: profile.user.email, name: profile.user.username }
    : currentUser;

  async function loadHomeData(query = search) {
    const requestId = homeRequestId.current + 1;
    homeRequestId.current = requestId;
    setIsLoading(true);
    setError(null);

    try {
      const [professionsResponse, profileResponse] = await Promise.all([
        contentApi.getLanguages({ title: query }),
        profileApi.get().catch(() => null),
      ]);

      const nextProfessions = Array.isArray(professionsResponse) ? professionsResponse : [];
      const nextTests = nextProfessions.flatMap((profession) =>
        (profession.tests ?? []).map((test) => ({
          ...test,
          languageId: profession.id,
          languageTitle: profession.title,
          professionId: profession.id,
          professionTitle: profession.title,
          status: 'published',
        }))
      );

      if (requestId !== homeRequestId.current) return;

      setProfessions(nextProfessions);
      if (!query) setAllProfessions(nextProfessions);
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
        onGoHome={goHomeWithRefresh}
      />
    );
  }

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
            const fallbackProfessionId = route.quiz?.languageId ?? route.quiz?.professionId ?? allProfessions[0]?.id ?? professions[0]?.id;
            if (!fallbackProfessionId) {
              Alert.alert('Ошибка', 'Сначала нужен хотя бы один язык на сервере');
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
      <ProfileScreen
        currentUser={displayUser}
        isAdmin={isAdmin}
        bottomInset={bottomInset}
        navHeight={NAV_HEIGHT}
        onGoHome={goHomeWithRefresh}
        onOpenFavorites={() => setRoute({ name: 'favorites' })}
        onOpenProfile={() => setRoute({ name: 'profile' })}
        onOpenAdmin={() => setRoute({ name: 'adminPanel' })}
        onLogout={onLogout}
      />
    );
  }

  if (route.name === 'adminPanel') {
    return (
      <AdminPanelScreen
        bottomInset={bottomInset}
        navHeight={NAV_HEIGHT}
        onBack={() => setRoute({ name: 'profile' })}
        onGoHome={goHomeWithRefresh}
        onOpenFavorites={() => setRoute({ name: 'favorites' })}
        onOpenProfile={() => setRoute({ name: 'profile' })}
        onOpenAdmin={() => setRoute({ name: 'adminPanel' })}
        onOpenUser={(user) => setRoute({ name: 'userEdit', user })}
      />
    );
  }

  if (route.name === 'userEdit') {
    return (
      <UserEditScreen
        user={route.user}
        bottomInset={bottomInset}
        navHeight={NAV_HEIGHT}
        onBack={() => setRoute({ name: 'adminPanel' })}
        onGoHome={goHomeWithRefresh}
        onOpenFavorites={() => setRoute({ name: 'favorites' })}
        onOpenProfile={() => setRoute({ name: 'profile' })}
        onOpenAdmin={() => setRoute({ name: 'adminPanel' })}
      />
    );
  }

  if (route.name === 'favorites') {
    return (
      <FavoritesScreen
        favorites={favorites}
        bottomInset={bottomInset}
        navHeight={NAV_HEIGHT}
        onGoHome={goHomeWithRefresh}
        onOpenFavorites={() => setRoute({ name: 'favorites' })}
        onOpenProfile={() => setRoute({ name: 'profile' })}
        onOpenQuiz={(test) => setRoute({ name: 'quiz', quiz: test })}
        onFavorite={toggleFavorite}
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
            <Text style={styles.headerTitle}>Привет, {displayUser?.name ?? 'User'}</Text>
            <Text style={styles.headerSubtitle}>{roleName}</Text>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <SvgXml xml={SEARCH_SVG} width="24" height="24" />
            <TextInput 
              placeholder="Поиск теста"
              placeholderTextColor="#7C7C7C"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={() => loadHomeData(search)}
              style={styles.searchInput}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Языки</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>Смотреть все</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.horizontalListWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalListContent}>
              {(professions.length ? professions : PROFESSIONS).map((item) => (
                <TouchableOpacity  key={item.id} style={styles.professionCard} activeOpacity={0.8}>
                  <Image 
                    source={{ uri: item.icon ?? FALLBACK_ICON }} 
                    style={styles.professionIcon} 
                    resizeMode="contain"
                  />
                  <Text numberOfLines={2} style={styles.professionName}>{item.title}</Text>
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
            {isLoading ? (
              <ActivityIndicator color="#7A1136" />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : tests.length ? (
              tests.map((test, index) => (
                <RecentCard
                  key={test.id}
                  title={test.title}
                  questions={`${test.questionCount ?? 0} вопросов`}
                  status={test.languageTitle ?? test.professionTitle ?? 'Язык'}
                  statusVariant={favoriteIds.has(test.id) ? 'passed' : 'not_passed'}
                  iconColor={index === 0 ? '#FFB58F' : index === 1 ? '#FDE68A' : '#D17E7E'}
                  onPress={() => setRoute({ name: 'quiz', quiz: test })}
                />
              ))
            ) : (
              <Text style={styles.errorText}>Вы еще не проходили тесты</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <BottomNav
        bottomInset={bottomInset}
        navHeight={NAV_HEIGHT}
        activeTab="home"
        onGoHome={goHomeWithRefresh}
        onOpenFavorites={() => setRoute({ name: 'favorites' })}
        onOpenProfile={() => setRoute({ name: 'profile' })}
        onOpenAdmin={() => {
          if (isAdmin) setRoute({ name: 'admin' });
        }}
        isAdmin={isAdmin}
      />
    </SafeAreaView>
  );
}

function ProfileScreen({ currentUser, isAdmin, bottomInset, navHeight, onGoHome, onOpenFavorites, onOpenProfile, onOpenAdmin, onLogout }) {
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

            <TouchableOpacity  activeOpacity={0.85} style={styles.logoutBtn} onPress={onLogout}>
              <Text style={styles.logoutText}>Выйти</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity activeOpacity={0.85} style={styles.adminPanelBtn} onPress={onOpenAdmin}>
            <Text style={styles.adminPanelText}>Панель администратора</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <BottomNav
        bottomInset={bottomInset}
        navHeight={navHeight}
        activeTab="profile"
        onGoHome={onGoHome}
        onOpenFavorites={onOpenFavorites}
        onOpenProfile={onOpenProfile}
        onOpenAdmin={onOpenAdmin}
        isAdmin={isAdmin}
      />
    </SafeAreaView>
  );
}

function AdminPanelScreen({ bottomInset, navHeight, onBack, onGoHome, onOpenFavorites, onOpenProfile, onOpenAdmin, onOpenUser }) {
  const [userSearch, setUserSearch] = useState('');
  const [testSearch, setTestSearch] = useState('');
  const users = [
    { id: 'user-1', name: 'Пользователь 1' },
    { id: 'user-2', name: 'Пользователь 2' },
    { id: 'user-3', name: 'Пользователь 3' },
  ];
  const adminTests = [
    { id: 'test-1', title: 'Java Senior', questions: '12 вопросов' },
    { id: 'test-2', title: 'Java Senior', questions: '12 вопросов' },
    { id: 'test-3', title: 'Java Senior', questions: '12 вопросов' },
  ];

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, styles.adminPanelScreen]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.adminPanelContent, { paddingBottom: navHeight + bottomInset + 24 }]}
      >
        <View style={styles.adminPanelHeader}>
          <TouchableOpacity onPress={onBack} style={styles.adminPanelBackBtn} hitSlop={12}>
            <Ionicons name="chevron-back" size={16} color="#252525" />
          </TouchableOpacity>
          <Text numberOfLines={1} style={styles.adminPanelTitle}>Панель администратора</Text>
          <View style={styles.adminPanelHeaderRight} />
        </View>

        <Text style={styles.adminPanelUsersTitle}>Пользователи</Text>

        <View style={styles.adminPanelSearchBar}>
          <SvgXml xml={SEARCH_SVG} width="24" height="24" />
          <TextInput
            placeholder="Поиск пользователя"
            placeholderTextColor="#7C7C7C"
            value={userSearch}
            onChangeText={setUserSearch}
            style={styles.adminPanelSearchInput}
          />
        </View>

        <View style={styles.adminPanelUsersList}>
          {users.map((user) => (
            <TouchableOpacity key={user.id} activeOpacity={0.85} style={styles.adminPanelUserRow} onPress={() => onOpenUser?.(user)}>
              <Image source={{ uri: PROFESSIONS[2].icon }} style={styles.adminPanelPythonIcon} resizeMode="contain" />
              <Text numberOfLines={1} style={styles.adminPanelUserName}>{user.name}</Text>
              <Ionicons name="chevron-forward" size={12} color="#252525" />
              <View pointerEvents="none" style={styles.adminPanelUserDivider} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.adminPanelTestsTitle}>Тесты</Text>

        <View style={styles.adminPanelSearchBar}>
          <SvgXml xml={SEARCH_SVG} width="24" height="24" />
          <TextInput
            placeholder="Поиск теста"
            placeholderTextColor="#7C7C7C"
            value={testSearch}
            onChangeText={setTestSearch}
            style={styles.adminPanelSearchInput}
          />
        </View>

        <View style={styles.adminPanelTestsList}>
          {adminTests.map((test) => (
            <TouchableOpacity key={test.id} activeOpacity={0.85} style={styles.adminPanelTestCard}>
              <Image source={{ uri: PROFESSIONS[2].icon }} style={styles.adminPanelPythonIcon} resizeMode="contain" />
              <View style={styles.adminPanelTestTextWrap}>
                <Text numberOfLines={1} style={styles.adminPanelTestName}>{test.title}</Text>
                <Text numberOfLines={1} style={styles.adminPanelTestQuestions}>{test.questions}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <BottomNav
        bottomInset={bottomInset}
        navHeight={navHeight}
        activeTab="profile"
        onGoHome={onGoHome}
        onOpenFavorites={onOpenFavorites}
        onOpenProfile={onOpenProfile}
        onOpenAdmin={onOpenAdmin}
        isAdmin
      />
    </SafeAreaView>
  );
}

function UserEditScreen({ user, bottomInset, navHeight, onBack, onGoHome, onOpenFavorites, onOpenProfile, onOpenAdmin }) {
  const initialName = 'User 1';
  const initialEmail = 'yourmail@mail.com';
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [role, setRole] = useState('');
  const [roleOpen, setRoleOpen] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const userTests = user?.tests ?? [];
  const canSave = name !== initialName || email !== initialEmail || role.length > 0;
  const roleOptions = ['Администратор', 'Редактор', 'Пользователь', 'Гость'];
  const canCreateTests = role === 'Администратор' || role === 'Редактор';

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, styles.adminPanelScreen]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.userEditContent, { paddingBottom: navHeight + bottomInset + 112 }]}
      >
        <View style={styles.adminPanelHeader}>
          <TouchableOpacity onPress={onBack} style={styles.adminPanelBackBtn} hitSlop={12}>
            <Ionicons name="chevron-back" size={16} color="#252525" />
          </TouchableOpacity>
          <Text numberOfLines={1} style={styles.userEditTitle}>Редактирование: {user?.name ?? 'Пользователь 1'}</Text>
        </View>

        <Text style={styles.userEditSectionTitle}>Основная информация</Text>
        <View style={styles.userEditDivider} />

        <TextInput
          value={name}
          onChangeText={setName}
          onFocus={() => {
            setRoleOpen(false);
            setFocusedField('name');
          }}
          onBlur={() => setFocusedField(null)}
          style={[styles.userEditInput, focusedField === 'name' ? styles.userEditInputActive : null]}
          placeholderTextColor="#C9C9C9"
        />

        <TextInput
          value={email}
          onChangeText={setEmail}
          onFocus={() => {
            setRoleOpen(false);
            setFocusedField('email');
          }}
          onBlur={() => setFocusedField(null)}
          style={[styles.userEditInput, focusedField === 'email' ? styles.userEditInputActive : null]}
          placeholderTextColor="#C9C9C9"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={[styles.userEditRoleBox, roleOpen ? styles.userEditRoleBoxOpen : null]}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.userEditRoleSelect, roleOpen ? styles.userEditRoleSelectOpen : null]}
            onPress={() => {
              Keyboard.dismiss();
              setFocusedField(null);
              setRoleOpen((value) => !value);
            }}
          >
            <Text style={[styles.userEditRolePlaceholder, role ? styles.userEditRoleValue : null]}>{role || 'Роль'}</Text>
            <Ionicons name={roleOpen ? 'chevron-down' : 'chevron-forward'} size={12} color="#252525" />
          </TouchableOpacity>

          {roleOpen ? (
            <View style={styles.userEditRoleOptions}>
              {roleOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  activeOpacity={0.85}
                  style={styles.userEditRoleOption}
                  onPress={() => {
                    setRole(option);
                    setRoleOpen(false);
                  }}
                >
                  <Text style={styles.userEditRoleOptionText}>{option}</Text>
                  {option !== roleOptions[roleOptions.length - 1] ? <View style={styles.userEditRoleOptionDivider} /> : null}
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.userEditDivider} />
        <Text style={styles.userEditTestsTitle}>Тесты</Text>

        {!canCreateTests ? (
          <Text style={styles.userEditEmptyTestsText}>У пользователя нет прав для создания теста</Text>
        ) : userTests.length === 0 ? (
          <Text style={styles.userEditEmptyTestsText}>Пользователь пока не создал ни одного теста</Text>
        ) : (
          <SwipeableUserTestCard />
        )}
      </ScrollView>

      <View style={[styles.userEditActions, { bottom: navHeight + bottomInset + 16 }]}>
        <TouchableOpacity activeOpacity={0.85} style={styles.userEditDeleteBtn}>
          <Text style={styles.userEditDeleteText}>Удалить пользователя</Text>
        </TouchableOpacity>

        <TouchableOpacity disabled={!canSave} activeOpacity={0.85} style={[styles.userEditSaveBtn, !canSave ? styles.userEditSaveBtnDisabled : null]}>
          <Text style={[styles.userEditSaveText, !canSave ? styles.userEditSaveTextDisabled : null]}>Сохранить изменения</Text>
        </TouchableOpacity>
      </View>

      <BottomNav
        bottomInset={bottomInset}
        navHeight={navHeight}
        activeTab="profile"
        onGoHome={onGoHome}
        onOpenFavorites={onOpenFavorites}
        onOpenProfile={onOpenProfile}
        onOpenAdmin={onOpenAdmin}
        isAdmin
      />
    </SafeAreaView>
  );
}

function UserEditScreen({ user, bottomInset, navHeight, onBack, onGoHome, onOpenFavorites, onOpenProfile, onOpenAdmin }) {
  const initialName = 'User 1';
  const initialEmail = 'yourmail@mail.com';
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [role, setRole] = useState('');
  const [roleOpen, setRoleOpen] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const userTests = user?.tests ?? [];
  const canSave = name !== initialName || email !== initialEmail || role.length > 0;
  const roleOptions = ['Администратор', 'Редактор', 'Пользователь', 'Гость'];
  const canCreateTests = role === 'Администратор' || role === 'Редактор';

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, styles.adminPanelScreen]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.userEditContent, { paddingBottom: navHeight + bottomInset + 112 }]}
      >
        <View style={styles.adminPanelHeader}>
          <TouchableOpacity  onPress={onBack} style={styles.adminPanelBackBtn} hitSlop={12}>
            <Ionicons name="chevron-back" size={16} color="#252525" />
          </TouchableOpacity>
          <Text numberOfLines={1} style={styles.userEditTitle}>Редактирование: {user?.name ?? 'Пользователь 1'}</Text>
        </View>

        <Text style={styles.userEditSectionTitle}>Основная информация</Text>
        <View style={styles.userEditDivider} />

        <TextInput 
          value={name}
          onChangeText={setName}
          onFocus={() => {
            setRoleOpen(false);
            setFocusedField('name');
          }}
          onBlur={() => setFocusedField(null)}
          style={[styles.userEditInput, focusedField === 'name' ? styles.userEditInputActive : null]}
          placeholderTextColor="#C9C9C9"
        />

        <TextInput 
          value={email}
          onChangeText={setEmail}
          onFocus={() => {
            setRoleOpen(false);
            setFocusedField('email');
          }}
          onBlur={() => setFocusedField(null)}
          style={[styles.userEditInput, focusedField === 'email' ? styles.userEditInputActive : null]}
          placeholderTextColor="#C9C9C9"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={[styles.userEditRoleBox, roleOpen ? styles.userEditRoleBoxOpen : null]}>
          <TouchableOpacity 
            activeOpacity={0.85}
            style={[styles.userEditRoleSelect, roleOpen ? styles.userEditRoleSelectOpen : null]}
            onPress={() => {
              Keyboard.dismiss();
              setFocusedField(null);
              setRoleOpen((value) => !value);
            }}
          >
            <Text style={[styles.userEditRolePlaceholder, role ? styles.userEditRoleValue : null]}>{role || 'Роль'}</Text>
            <Ionicons name={roleOpen ? 'chevron-down' : 'chevron-forward'} size={12} color="#252525" />
          </TouchableOpacity>

          {roleOpen ? (
            <View style={styles.userEditRoleOptions}>
              {roleOptions.map((option) => (
                <TouchableOpacity 
                  key={option}
                  activeOpacity={0.85}
                  style={styles.userEditRoleOption}
                  onPress={() => {
                    setRole(option);
                    setRoleOpen(false);
                  }}
                >
                  <Text style={styles.userEditRoleOptionText}>{option}</Text>
                  {option !== roleOptions[roleOptions.length - 1] ? <View style={styles.userEditRoleOptionDivider} /> : null}
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.userEditDivider} />
        <Text style={styles.userEditTestsTitle}>Тесты</Text>

        {!canCreateTests ? (
          <Text style={styles.userEditEmptyTestsText}>У пользователя нет прав для создания теста</Text>
        ) : userTests.length === 0 ? (
          <Text style={styles.userEditEmptyTestsText}>Пользователь пока не создал ни одного теста</Text>
        ) : (
          <SwipeableUserTestCard />
        )}
      </ScrollView>

      <View style={[styles.userEditActions, { bottom: navHeight + bottomInset + 16 }]}>
        <TouchableOpacity  activeOpacity={0.85} style={styles.userEditDeleteBtn}>
          <Text style={styles.userEditDeleteText}>Удалить пользователя</Text>
        </TouchableOpacity>

        <TouchableOpacity  disabled={!canSave} activeOpacity={0.85} style={[styles.userEditSaveBtn, !canSave ? styles.userEditSaveBtnDisabled : null]}>
          <Text style={[styles.userEditSaveText, !canSave ? styles.userEditSaveTextDisabled : null]}>Сохранить изменения</Text>
        </TouchableOpacity>
      </View>

      <BottomNav
        bottomInset={bottomInset}
        navHeight={navHeight}
        activeTab="profile"
        onGoHome={onGoHome}
        onOpenFavorites={onOpenFavorites}
        onOpenProfile={onOpenProfile}
        onOpenAdmin={onOpenAdmin}
        isAdmin
      />
    </SafeAreaView>
  );
}

function SwipeableUserTestCard() {
  const swipeProgress = useRef(new Animated.Value(0)).current;
  const swipeProgressValue = useRef(0);
  const swipeStartValue = useRef(0);
  const [isSwiped, setIsSwiped] = useState(false);

  useEffect(() => {
    const listenerId = swipeProgress.addListener(({ value }) => {
      swipeProgressValue.current = value;
    });

    return () => swipeProgress.removeListener(listenerId);
  }, [swipeProgress]);

  function animateSwipe(open) {
    setIsSwiped(open);
    Animated.spring(swipeProgress, {
      toValue: open ? 1 : 0,
      useNativeDriver: false,
    }).start();
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderGrant: () => {
        swipeStartValue.current = swipeProgressValue.current;
        if (!isSwiped) setIsSwiped(true);
      },
      onPanResponderMove: (_, gesture) => {
        const nextValue = Math.max(0, Math.min(1, swipeStartValue.current - gesture.dx / 40));
        swipeProgress.setValue(nextValue);
      },
      onPanResponderRelease: (_, gesture) => {
        animateSwipe(gesture.dx < -12 || swipeProgressValue.current > 0.5);
      },
    })
  ).current;
  const cardMarginRight = swipeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 40],
  });
  const deleteOpacity = swipeProgress.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: [0, 1, 1],
  });

  return (
    <View style={styles.userEditSwipeRow}>
      <Animated.View pointerEvents={isSwiped ? 'auto' : 'none'} style={[styles.userEditDeleteTestSlot, { opacity: deleteOpacity }]}>
        <TouchableOpacity activeOpacity={0.85} style={styles.userEditDeleteTestBtn}>
          <SvgXml xml={BIN_SVG} width="24" height="24" />
        </TouchableOpacity>
      </Animated.View>

      <View
        {...panResponder.panHandlers}
        style={styles.userEditSwipeCardWrap}
      >
        <Animated.View style={{ marginRight: cardMarginRight }}>
          <TouchableOpacity activeOpacity={0.85} style={styles.adminPanelTestCard}>
            <Image source={{ uri: PROFESSIONS[2].icon }} style={styles.adminPanelPythonIcon} resizeMode="contain" />
            <View style={styles.adminPanelTestTextWrap}>
              <Text numberOfLines={1} style={styles.adminPanelTestName}>Java Senior</Text>
              <Text numberOfLines={1} style={styles.adminPanelTestQuestions}>12 вопросов</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

function FavoritesScreen({ favorites, bottomInset, navHeight, onGoHome, onOpenFavorites, onOpenProfile, onOpenQuiz }) {
  const favoriteItems = favorites.map((item, index) => ({
    quiz: { id: item.testId, title: item.testTitle, questionCount: item.questionCount },
    id: item.testId,
    title: item.testTitle,
    questions: item.languageTitle ?? item.professionTitle ?? 'Язык',
    accent: index === 0 ? '#F7D76D' : index === 1 ? '#F6D85F' : '#F3C95A',
  }));

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, styles.favoritesScreen]}>
      <View style={styles.favoritesShell}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.favoritesScrollContent, { paddingBottom: navHeight + bottomInset + 24 }]}
        >
          <View style={styles.favoritesHeader}>
            <TouchableOpacity  onPress={onGoHome} activeOpacity={0.8} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={18} color="#252525" />
            </TouchableOpacity>
            <Text style={styles.favoritesTitle}>Избранное</Text>
          </View>

          <View style={styles.favoritesList}>
            {favoriteItems.map((item) => (
              <TouchableOpacity 
                key={item.id}
                activeOpacity={0.9}
                style={styles.recentCard}
                onPress={() => onOpenQuiz?.(item.quiz)}
              >
                <View style={styles.recentLeft}>
                  <View style={[styles.recentIcon, { backgroundColor: item.accent }]} />

                  <View>
                    <Text numberOfLines={1} style={styles.recentTitle}>
                      {item.title}
                    </Text>
                    <Text style={styles.recentQuestions}>{item.questions}</Text>
                  </View>
                </View>

                <View style={[styles.statusPill, styles.statusPillPassed]}>
                  <Text numberOfLines={1} style={[styles.statusText, styles.statusTextPassed]}>
                    В избранном
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <BottomNav
        bottomInset={bottomInset}
        navHeight={navHeight}
        activeTab="favorites"
        onGoHome={onGoHome}
        onOpenFavorites={onOpenFavorites}
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

function BottomNav({ bottomInset, navHeight, activeTab, onGoHome, onOpenFavorites, onOpenProfile, onOpenAdmin, isAdmin }) {
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
              <TouchableOpacity  style={styles.bottomNavBtn} onPress={onGoHome} activeOpacity={0.8}>
                <SvgXml
                  xml={HOME_NAV_SVG}
                  width="32"
                  height="32"
                />
              </TouchableOpacity>

              <TouchableOpacity  style={styles.bottomNavBtn} onPress={onOpenFavorites} activeOpacity={0.8}>
                <SvgXml
                  xml={activeTab === 'favorites' ? HEART_ACTIVE_SVG : HEART_INACTIVE_SVG}
                  width="32"
                  height="32"
                />
              </TouchableOpacity>

              <TouchableOpacity  style={styles.bottomNavBtn} onPress={onOpenProfile} activeOpacity={0.8}>
                <SvgXml
                  xml={activeTab === 'profile' ? PROFILE_ACTIVE_SVG : PROFILE_INACTIVE_SVG}
                  width="32"
                  height="32"
                />
              </TouchableOpacity>

              {isAdmin ? (
                <TouchableOpacity style={styles.bottomNavBtn} onPress={onOpenAdmin} activeOpacity={0.8}>
                  <SvgXml xml={PLUS_NAV_SVG} width="32" height="32" />
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
    <TouchableOpacity  onPress={onPress} activeOpacity={0.9} style={styles.recentCard}>
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
  favoritesScreen: {
    backgroundColor: '#FFFFFF',
  },
  adminPanelScreen: {
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  adminPanelContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  userEditContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  adminPanelHeader: {
    height: 23,
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminPanelBackBtn: {
    width: 16,
    height: 16,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  adminPanelTitle: {
    flex: 1,
    marginLeft: 16,
    textAlign: 'left',
    fontFamily: 'Roboto_500Medium',
    fontSize: 20,
    lineHeight: 23,
    color: '#252525',
  },
  adminPanelHeaderRight: {
    width: 16,
    height: 16,
  },
  adminPanelUsersTitle: {
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    fontSize: 18,
    lineHeight: 22,
    color: '#252525',
  },
  adminPanelSearchBar: {
    marginTop: 16,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#EAEAEA',
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  adminPanelSearchInput: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 0,
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: '#7C7C7C',
    textAlignVertical: 'center',
  },
  adminPanelUsersList: {
    marginTop: 16,
  },
  adminPanelUserRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingBottom: 16,
  },
  adminPanelUserDivider: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    borderRadius: 999,
    backgroundColor: '#D9D9D9',
  },
  adminPanelPythonIcon: {
    width: 44,
    height: 44,
  },
  adminPanelUserName: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 20,
    color: '#252525',
  },
  adminPanelTestsTitle: {
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    fontSize: 18,
    lineHeight: 22,
    color: '#252525',
  },
  adminPanelTestsList: {
    marginTop: 16,
    gap: 16,
  },
  adminPanelTestCard: {
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#D8EFE3',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  adminPanelTestTextWrap: {
    flex: 1,
    marginLeft: 16,
  },
  adminPanelTestName: {
    fontFamily: 'Roboto_500Medium',
    fontSize: 12,
    lineHeight: 16,
    color: '#252525',
  },
  adminPanelTestQuestions: {
    marginTop: 4,
    fontFamily: 'Roboto_500Medium',
    fontSize: 10,
    lineHeight: 12,
    color: '#8A8983',
  },
  userEditTitle: {
    flex: 1,
    marginLeft: 16,
    textAlign: 'left',
    fontFamily: 'Roboto_500Medium',
    fontSize: 20,
    lineHeight: 23,
    color: '#252525',
  },
  userEditSectionTitle: {
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 19,
    color: '#252525',
  },
  userEditDivider: {
    height: 2,
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: '#D9D9D9',
  },
  userEditInput: {
    height: 56,
    marginTop: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#D9D9D9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 0,
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#252525',
    textAlignVertical: 'center',
  },
  userEditInputActive: {
    borderColor: '#E95B20',
  },
  userEditRoleBox: {
    marginTop: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#D9D9D9',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  userEditRoleBoxOpen: {
    borderColor: '#FF7A45',
  },
  userEditRoleSelect: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userEditRoleSelectOpen: {
    height: 19,
    marginTop: 16,
    alignItems: 'center',
  },
  userEditRolePlaceholder: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 19,
    color: '#C9C9C9',
  },
  userEditRoleValue: {
    color: '#252525',
  },
  userEditRoleOptions: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 10,
    gap: 10,
  },
  userEditRoleOption: {
    minHeight: 19,
    justifyContent: 'center',
  },
  userEditRoleOptionText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 19,
    color: '#252525',
  },
  userEditRoleOptionDivider: {
    height: 2,
    marginTop: 10,
    borderRadius: 999,
    backgroundColor: '#D9D9D9',
  },
  userEditTestsTitle: {
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: '#252525',
  },
  userEditEmptyTestsText: {
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: '#A9A9A9',
  },
  userEditTestRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userEditSwipeRow: {
    height: 76,
    marginTop: 16,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  userEditSwipeCardWrap: {
    width: '100%',
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  userEditSwipeCardWrapOpen: {
    width: 'auto',
    marginRight: 40,
  },
  userEditTestCard: {
    flex: 1,
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#D8EFE3',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  userEditDeleteTestSlot: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  userEditDeleteTestBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userEditActions: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 16,
  },
  userEditDeleteBtn: {
    flex: 1,
    height: 51,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#76113A',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#76113A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  userEditDeleteText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 15,
    lineHeight: 18,
    color: '#76113A',
  },
  userEditSaveBtn: {
    flex: 1,
    height: 51,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#76113A',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#76113A',
    shadowColor: '#76113A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  userEditSaveBtnDisabled: {
    borderColor: '#DEDEDE',
    backgroundColor: '#FFFFFF',
    shadowColor: '#A9A9A9',
    shadowOpacity: 0.16,
  },
  userEditSaveText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 15,
    lineHeight: 18,
    color: '#FFFFFF',
  },
  userEditSaveTextDisabled: {
    color: '#A9A9A9',
  },
  favoritesShell: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 0,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  favoritesScrollContent: {
    paddingTop: 24,
  },
  favoritesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  favoritesTitle: {
    fontFamily: 'Roboto_500Medium',
    fontSize: 20,
    lineHeight: 24,
    color: '#252525',
  },
  favoritesList: {
    gap: 16,
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
    boxShadow: '0px 8px 14px #F1EFFF',
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
  adminPanelBtn: {
    alignSelf: 'stretch',
    height: 51,
    marginTop: 16,
    marginHorizontal: -16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#E95B20',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  adminPanelText: {
    fontFamily: 'Roboto',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 20,
    color: '#E95B20',
    textAlign: 'center',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8EFE3',
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
    justifyContent: 'center',
    alignItems: 'center',
    gap: 64,
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
    boxShadow: '-2px -3px 3px #F2EFFF',
  },
  bottomNavShadowInner: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#FFFFFF',
    boxShadow: '2px -3px 3px #F2EFFF',
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
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
