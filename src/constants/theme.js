export const COLORS = {
  primary: '#A379F5',
  secondary: '#2D1B4D',
  background: {
    start: '#1E1E3F',
    end: '#6B2D90'
  },
  white: '#FFFFFF',
  black: '#000000',
  gray: '#999999',
  success: '#A4E764'
};

export const SIZES = {
  base: 8,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  extraLarge: 24,
};

export const FONTS = {
  bold: 'bold',
  semiBold: '600',
  medium: '500',
  regular: '400',
  light: '300',
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  medium: {
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
  },
  dark: {
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.41,
    shadowRadius: 9.11,
    elevation: 14,
  },
}; 