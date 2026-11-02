import React, {useState} from 'react';
import {StyleSheet, Text} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import AppButton from '../../components/common/AppButton';
import FilterChips from '../../components/common/FilterChips';
import FormInput from '../../components/common/FormInput';
import ScreenContainer from '../../components/common/ScreenContainer';
import {useAppData} from '../../context/AppDataContext';
import {useSync} from '../../context/SyncContext';
import {ROUTES, type AssignmentStackParamList} from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import {formatDateTime, parseDateTime} from '../../utils/date';
import {validateDueDate, validateTitle} from '../../utils/validators';

type Props = NativeStackScreenProps<AssignmentStackParamList, typeof ROUTES.AssignmentForm>;

const defaultDue = (): string => {
  const d = new Date();
  return formatDateTime(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 23, 59));
};

export default function AssignmentFormScreen({navigation}: Props) {
  const {courses, addAssignment} = useAppData();
  const {isOnline} = useSync();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [due, setDue] = useState(defaultDue);
  const [courseId, setCourseId] = useState('');
  const [errors, setErrors] = useState({title: '', due: '', course: '', form: ''});
  const [saving, setSaving] = useState(false);

  const selectedCourse = courseId || (courses[0] ? String(courses[0].id) : '');
  const courseOptions = courses.map(c => ({value: String(c.id), label: c.name}));

  const onSave = async () => {
    const next = {
      title: validateTitle(title),
      due: validateDueDate(due),
      course: selectedCourse ? '' : 'Chưa có danh sách môn học để chọn',
      form: '',
    };
    setErrors(next);
    if (next.title || next.due || next.course) {
      return;
    }
    const dueDate = parseDateTime(due) as Date;
    setSaving(true);
    const result = await addAssignment({
      courseId: Number(selectedCourse),
      title,
      description,
      dueDate: dueDate.toISOString(),
    });
    setSaving(false);
    if (result.ok) {
      navigation.goBack(); // lưu thành công (hoặc đã vào hàng đợi) thì quay về danh sách
    } else {
      setErrors({...next, form: result.error?.message ?? 'Không thể lưu bài tập.'});
    }
  };

  return (
    <ScreenContainer scroll>
      <FormInput
        label="Tiêu đề"
        value={title}
        onChangeText={setTitle}
        error={errors.title}
        placeholder="Ví dụ: Thực hành 5"
      />
      <FormInput
        label="Mô tả"
        value={description}
        onChangeText={setDescription}
        placeholder="Nội dung bài tập (không bắt buộc)"
        multiline
      />
      <Text style={styles.label}>Môn học</Text>
      <FilterChips options={courseOptions} selected={selectedCourse} onSelect={setCourseId} />
      {errors.course ? <Text style={styles.error}>{errors.course}</Text> : null}
      <FormInput
        label="Hạn nộp (dd/MM/yyyy HH:mm)"
        value={due}
        onChangeText={setDue}
        error={errors.due}
        keyboardType="numbers-and-punctuation"
        placeholder="31/12/2026 23:59"
      />
      {errors.form ? <Text style={styles.error}>{errors.form}</Text> : null}
      {!isOnline ? (
        <Text style={styles.hint}>Đang offline: bài tập sẽ được lưu và đồng bộ khi có mạng.</Text>
      ) : null}
      <AppButton title="Lưu bài tập" onPress={onSave} loading={saving} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: {...typography.label, color: colors.text, marginBottom: spacing.xs},
  error: {...typography.caption, color: colors.danger, marginBottom: spacing.sm},
  hint: {...typography.caption, color: colors.textMuted, marginBottom: spacing.md},
});
