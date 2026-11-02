/**
 * @param {string} value - Bắt buộc
 * @param {(text: string) => void} onChangeText - Bắt buộc
 * @param {string} [placeholder='Tìm kiếm…']
 */
import React from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import colors from '../../theme/colors';
import spacing, {MIN_TOUCH, radius} from '../../theme/spacing';
import typography from '../../theme/typography';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({value, onChangeText, placeholder = 'Tìm kiếm…'}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={placeholder}
        autoCorrect={false}
        returnKeyType="search"
      />
      {value ? (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel="Xóa nội dung tìm kiếm"
          style={styles.clear}>
          <Text style={styles.clearText}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: spacing.md,
  },
  icon: {...typography.body, marginRight: spacing.sm},
  input: {flex: 1, minHeight: MIN_TOUCH, color: colors.text, ...typography.body},
  clear: {width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center'},
  clearText: {...typography.body, color: colors.textMuted},
});
