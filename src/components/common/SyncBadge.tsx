/**
 * @param {boolean} pending - Bắt buộc. true thì hiện nhãn "Chưa đồng bộ"
 */
import React from 'react';
import Badge from './Badge';

interface Props {
  pending: boolean;
}

export default function SyncBadge({pending}: Props) {
  return pending ? <Badge label="Chưa đồng bộ" tone="warning" /> : null;
}
