/**
 * @param {string} label - Bắt buộc
 * @param {'success'|'warning'|'danger'|'info'|'neutral'} [tone='neutral']
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import colors from '../../theme/colors';
import spacing, {radius} from '../../theme/spacing';
import typography from '../../theme/typography';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface Props {
  label: string;
  tone?: Tone;
}

const TONES: Record<Tone, {bg: string; fg: string}> = {
  success: {bg: colors.successLight, fg: colors.success},
  warning: {bg: colors.warningLight, fg: colors.warning},
  danger: {bg: colors.dangerLight, fg: colors.danger},
  info: {bg: colors.primaryLight, fg: colors.primary},
  neutral: {bg: colors.border, fg: colors.textMuted},
};

export default function Badge({label, tone = 'neutral'}: Props) {
  const t = TONES[tone];
  return (
    <View style={[styles.badge, {backgroundColor: t.bg}]}>
      <Text style={[styles.text, {color: t.fg}]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  text: {...typography.label},
});
