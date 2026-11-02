import {useCallback} from 'react';
import {Alert} from 'react-native';
import {useAppData} from '../context/AppDataContext';
import type {Id} from '../types';

// Đổi trạng thái bài tập (cập nhật lạc quan); API lỗi thì đã hoàn tác và báo cho người dùng
export default function useToggleAssignment(): (id: Id) => Promise<void> {
  const {toggleAssignment} = useAppData();
  return useCallback(
    async (id: Id) => {
      const result = await toggleAssignment(id);
      if (!result.ok && result.error) {
        Alert.alert('Không thể cập nhật', `${result.error.message}\nThay đổi đã được hoàn tác.`);
      }
    },
    [toggleAssignment],
  );
}
