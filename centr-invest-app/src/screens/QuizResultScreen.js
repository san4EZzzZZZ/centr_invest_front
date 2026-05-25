import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from '../components/SilentTouchables';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatDuration(value) {
  if (value == null) return '';

  const text = String(value).trim();
  if (!text) return '';

  const minutesMatch = text.match(/^(\d+)\s*мин\s*(\d+)\s*сек$/i);
  if (minutesMatch) {
    return `${Number(minutesMatch[1])} мин ${Number(minutesMatch[2])} сек`;
  }

  const secondsMatch = text.match(/^(\d+)\s*сек$/i);
  if (secondsMatch) {
    return `${Number(secondsMatch[1])} сек`;
  }

  return text;
}

function getResultCopy(score, total, userName) {
  const ratio = total > 0 ? score / total : 0;
  const safeName = String(userName || 'User').trim() || 'User';

  if (ratio >= 0.7) {
    return {
      title: 'Поздравляем!',
      subtitle: `Хорошая работа, ${safeName}! Ты справился отлично`,
    };
  }

  return {
    title: 'Хорошая попытка!',
    subtitle: `Начало положено, ${safeName}!\nЕсть над чем поработать`,
  };
}

function Decor() {
  return (
    <View pointerEvents="none" style={styles.decorLayer}>
      <Ionicons name="star-outline" size={26} color="#FFA180" style={[styles.star, { top: 28, left: 118 }]} />
      <Ionicons name="star-outline" size={18} color="#FFA180" style={[styles.star, { top: 80, left: 64 }]} />
      <Ionicons name="star-outline" size={18} color="#FFA180" style={[styles.star, { top: 84, right: 84 }]} />
      <Ionicons name="star-outline" size={30} color="#FFA180" style={[styles.star, { top: 104, left: 22 }]} />
      <Ionicons name="star-outline" size={30} color="#FFA180" style={[styles.star, { top: 104, right: 22 }]} />
      <Ionicons name="star-outline" size={16} color="#FFA180" style={[styles.star, { top: 188, left: 42 }]} />
      <Ionicons name="star-outline" size={30} color="#FFA180" style={[styles.star, { top: 188, right: 14 }]} />
      <Ionicons name="star-outline" size={18} color="#FFA180" style={[styles.star, { top: 224, right: 78 }]} />
      <Ionicons name="star-outline" size={28} color="#FFA180" style={[styles.star, { top: 236, left: 120 }]} />

      <View style={[styles.confettiCluster, { left: 40, top: 254 }]}>
        <View style={[styles.confettiStroke, { width: 10, transform: [{ rotate: '-24deg' }] }]} />
        <View style={[styles.confettiStroke, { width: 7, marginTop: 6, marginLeft: 10, transform: [{ rotate: '12deg' }] }]} />
        <View style={[styles.confettiStroke, { width: 12, marginTop: 6, marginLeft: 2, transform: [{ rotate: '-8deg' }] }]} />
      </View>

      <View style={[styles.confettiCluster, { right: 34, top: 256 }]}>
        <View style={[styles.confettiStroke, { width: 10, transform: [{ rotate: '20deg' }] }]} />
        <View style={[styles.confettiStroke, { width: 8, marginTop: 6, marginLeft: 8, transform: [{ rotate: '-10deg' }] }]} />
        <View style={[styles.confettiStroke, { width: 12, marginTop: 6, marginLeft: 0, transform: [{ rotate: '12deg' }] }]} />
      </View>

      <Ionicons name="triangle-outline" size={18} color="#FFA180" style={[styles.star, { top: 286, left: 48, transform: [{ rotate: '-18deg' }] }]} />
      <Ionicons name="triangle-outline" size={20} color="#FFA180" style={[styles.star, { top: 286, right: 44, transform: [{ rotate: '16deg' }] }]} />
    </View>
  );
}

export default function QuizResultScreen({ result, userName, avatarUrl, onGoHome, onOpenReview }) {
  const safeScore = typeof result?.correctAnswers === 'number' ? result.correctAnswers : 0;
  const safeTotal = typeof result?.totalQuestions === 'number' ? result.totalQuestions : 0;
  const duration = formatDuration(result?.duration);
  const copy = getResultCopy(safeScore, safeTotal, userName);
  const badgeSource = avatarUrl ? { uri: avatarUrl } : require('../../assets/icon.png');

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.container}>
        <Decor />

        <View style={styles.badgeOuter}>
          <View style={styles.badgeMid}>
            <View style={styles.badgeInner}>
              <Image source={badgeSource} style={styles.badgeImage} />
            </View>
          </View>
        </View>

        <Text style={styles.recordLabel}>Твой Рекорд</Text>
        <Text style={styles.recordValue}>
          {safeScore}/{safeTotal}
        </Text>

        {duration ? (
          <View style={styles.durationRow}>
            <Ionicons name="time-outline" size={14} color="#B6BBC8" style={styles.durationIcon} />
            <Text style={styles.durationText}>{duration}</Text>
          </View>
        ) : null}

        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>

        <View style={styles.spacer} />

        <TouchableOpacity onPress={onOpenReview} activeOpacity={0.85}>
          <Text style={styles.reviewLink}>Перейти к разбору</Text>
        </TouchableOpacity>

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
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 22,
    alignItems: 'center',
  },
  decorLayer: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    height: 360,
  },
  star: {
    position: 'absolute',
  },
  confettiCluster: {
    position: 'absolute',
  },
  confettiStroke: {
    height: 2,
    borderRadius: 999,
    backgroundColor: '#FFA180',
  },
  badgeOuter: {
    marginTop: 58,
    width: 152,
    height: 152,
    borderRadius: 76,
    borderWidth: 4,
    borderStyle: 'dashed',
    borderColor: '#FF8D62',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeMid: {
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: '#FF8D62',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInner: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: '#FFF1C8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badgeImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
    resizeMode: 'cover',
  },
  recordLabel: {
    marginTop: 24,
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 19,
    color: '#505050',
  },
  recordValue: {
    marginTop: 10,
    fontFamily: 'Roboto_500Medium',
    fontSize: 24,
    lineHeight: 28,
    color: '#8C1D4B',
  },
  durationRow: {
    marginTop: 8,
    minHeight: 16,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    left: 4,
  },
  durationIcon: {
    position: 'absolute',
    left: -18,
    top: 1,
  },
  durationText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 15,
    lineHeight: 16,
    color: '#B6BBC8',
    textAlignVertical: 'center',
  },
  title: {
    marginTop: 24,
    fontFamily: 'Roboto_500Medium',
    fontSize: 27,
    lineHeight: 32,
    color: '#8C1D4B',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 20,
    color: '#8E8E8E',
    textAlign: 'center',
    maxWidth: 280,
  },
  spacer: {
    flex: 1,
  },
  reviewLink: {
    marginBottom: 24,
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 19,
    color: '#FFA180',
  },
  homeBtn: {
    width: '100%',
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
