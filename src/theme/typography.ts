import type {TextStyle} from 'react-native';

const typography: Record<
  'h1' | 'h2' | 'h3' | 'body' | 'bodyBold' | 'caption' | 'label',
  TextStyle
> = {
  h1: {fontSize: 24, fontWeight: '800'},
  h2: {fontSize: 20, fontWeight: '700'},
  h3: {fontSize: 17, fontWeight: '700'},
  body: {fontSize: 15, fontWeight: '400'},
  bodyBold: {fontSize: 15, fontWeight: '700'},
  caption: {fontSize: 12, fontWeight: '400'},
  label: {fontSize: 13, fontWeight: '600'},
};

export default typography;
