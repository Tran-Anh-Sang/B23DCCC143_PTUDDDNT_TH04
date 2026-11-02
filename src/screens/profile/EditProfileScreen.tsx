import React, {useState} from 'react';
import {StyleSheet, Text} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import AppButton from '../../components/common/AppButton';
import FormInput from '../../components/common/FormInput';
import LoadingView from '../../components/common/LoadingView';
import ScreenContainer from '../../components/common/ScreenContainer';
import {useAppData} from '../../context/AppDataContext';
import {useSync} from '../../context/SyncContext';
import {ROUTES, type ProfileStackParamList} from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import {
  validateEmail,
  validateFullName,
  validatePhone,
  validateRequired,
} from '../../utils/validators';

type Props = NativeStackScreenProps<ProfileStackParamList, typeof ROUTES.EditProfile>;

export default function EditProfileScreen({navigation}: Props) {
  const {student, updateStudent} = useAppData();
  const {isOnline} = useSync();
  const [fullName, setFullName] = useState(student?.fullName ?? '');
  const [className, setClassName] = useState(student?.className ?? '');
  const [major, setMajor] = useState(student?.major ?? '');
  const [email, setEmail] = useState(student?.email ?? '');
  const [phone, setPhone] = useState(student?.phone ?? '');
  const [errors, setErrors] = useState({fullName: '', className: '', major: '', email: '', phone: '', form: ''});
  const [saving, setSaving] = useState(false);

  if (!student) {
    return (
      <ScreenContainer>
        <LoadingView />
      </ScreenContainer>
    );
  }

  const onSave = async () => {
    const next = {
      fullName: validateFullName(fullName),
      className: validateRequired(className, 'lớp'),
      major: validateRequired(major, 'ngành'),
      email: validateEmail(email),
      phone: validatePhone(phone),
      form: '',
    };
    setErrors(next);
    if (next.fullName || next.className || next.major || next.email || next.phone) {
      return;
    }
    setSaving(true);
    const result = await updateStudent({
      fullName: fullName.trim(),
      className: className.trim(),
      major: major.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    setSaving(false);
    if (result.ok) {
      navigation.goBack();
    } else {
      setErrors({...next, form: result.error?.message ?? 'Không thể lưu thông tin.'});
    }
  };

  return (
    <ScreenContainer scroll>
      <FormInput label="Mã sinh viên" value={student.studentCode} onChangeText={() => undefined} editable={false} />
      <FormInput label="Họ tên" value={fullName} onChangeText={setFullName} error={errors.fullName} />
      <FormInput label="Lớp" value={className} onChangeText={setClassName} error={errors.className} />
      <FormInput label="Ngành" value={major} onChangeText={setMajor} error={errors.major} />
      <FormInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        keyboardType="email-address"
      />
      <FormInput
        label="Số điện thoại"
        value={phone}
        onChangeText={setPhone}
        error={errors.phone}
        keyboardType="phone-pad"
      />
      {errors.form ? <Text style={styles.error}>{errors.form}</Text> : null}
      {!isOnline ? (
        <Text style={styles.hint}>Đang offline: thay đổi sẽ được đồng bộ khi có mạng.</Text>
      ) : null}
      <AppButton title="Lưu thay đổi" onPress={onSave} loading={saving} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  error: {...typography.caption, color: colors.danger, marginBottom: spacing.sm},
  hint: {...typography.caption, color: colors.textMuted, marginBottom: spacing.md},
});
