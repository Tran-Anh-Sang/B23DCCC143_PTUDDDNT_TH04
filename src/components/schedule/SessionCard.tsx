/**
 * @param {Session} session - Bắt buộc (có kèm course khi gọi _expand=course)
 * @param {(session: Session) => void} onPress - Bắt buộc
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Card from '../common/Card';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import type {Session} from '../../types';

interface Props {
  session: Session;
  onPress: (session: Session) => void;
}

function SessionCard({session, onPress}: Props) {
  const name = session.course?.name ?? 'Môn học';
  return (
    <Card
      onPress={() => onPress(session)}
      accessibilityLabel={`${name}, ${session.startTime} đến ${session.endTime}, phòng ${session.room}`}>
      <View style={styles.row}>
        <View style={styles.time}>
          <Text style={styles.start}>{session.startTime}</Text>
          <Text style={styles.end}>{session.endTime}</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.room}>Phòng {session.room}</Text>
        </View>
      </View>
    </Card>
  );
}

export default React.memo(SessionCard);

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center'},
  time: {width: 64, marginRight: spacing.md},
  start: {...typography.bodyBold, color: colors.primary},
  end: {...typography.caption, color: colors.textMuted},
  body: {flex: 1},
  name: {...typography.h3, color: colors.text},
  room: {...typography.body, color: colors.textMuted, marginTop: spacing.xs},
});
