import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QuizResultScreen({ quizTitle, score, total, onGoHome, onReview }) {
  const safeScore = typeof score === 'number' ? score : 0;
  const safeTotal = typeof total === 'number' ? total : 0;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.decor}>
          <Ionicons name="star-outline" size={22} color="#FF7A45" style={[styles.star, { top: 10, left: 30 }]} />
          <Ionicons name="star-outline" size={16} color="#FF7A45" style={[styles.star, { top: 48, right: 44 }]} />
          <Ionicons name="star-outline" size={14} color="#FF7A45" style={[styles.star, { top: 92, left: 10 }]} />
          <Ionicons name="star-outline" size={18} color="#FF7A45" style={[styles.star, { top: 104, right: 10 }]} />
          <Ionicons name="star-outline" size={14} color="#FF7A45" style={[styles.star, { top: 170, left: 60 }]} />
          <Ionicons name="star-outline" size={20} color="#FF7A45" style={[styles.star, { top: 180, right: 70 }]} />
        </View>

        <View style={styles.badgeOuter}>
          <View style={styles.badgeMid}>
            <View style={styles.badgeInner}>
              <Image source={require('../../assets/icon.png')} style={styles.badgeImage} />
            </View>
          </View>
        </View>

        <Text style={styles.recordLabel}>Твой Рекорд</Text>
        <Text style={styles.recordValue}>
          {safeScore}/{safeTotal}
        </Text>

        <Text style={styles.congrats}>Поздравляем!</Text>
        <Text style={styles.subtitle}>Хорошая работа, User! Ты справился отлично</Text>

        <TouchableOpacity onPress={onReview} activeOpacity={0.8} style={styles.reviewBtn}>
          <Text style={styles.reviewText}>Перейти к разбору</Text>
        </TouchableOpacity>

        <View style={styles.bottom}>
          <TouchableOpacity onPress={onGoHome} activeOpacity={0.9} style={styles.homeBtn}>
            <Text style={styles.homeBtnText}>На главную</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decor: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    height: 220,
  },
  star: {
    position: 'absolute',
  },
  badgeOuter: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#FF7A45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeMid: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FF7A45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#FFF3D8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badgeImage: {
    width: 78,
    height: 78,
    borderRadius: 39,
    resizeMode: 'cover',
  },
  recordLabel: {
    marginTop: 18,
    fontFamily: 'Roboto',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 14,
    color: '#252525',
  },
  recordValue: {
    marginTop: 8,
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 28,
    lineHeight: 28,
    color: '#7A1136',
  },
  congrats: {
    marginTop: 14,
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 32,
    lineHeight: 34,
    color: '#7A1136',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 14,
    fontFamily: 'Roboto',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 18,
    color: '#8A8983',
    textAlign: 'center',
    maxWidth: 300,
  },
  reviewBtn: {
    marginTop: 46,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  reviewText: {
    fontFamily: 'Roboto',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 14,
    color: '#FF7A45',
  },
  bottom: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
  },
  homeBtn: {
    height: 56,
    borderRadius: 14,
    backgroundColor: '#7A1136',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtnText: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 16,
    color: '#FFFFFF',
  },
});

