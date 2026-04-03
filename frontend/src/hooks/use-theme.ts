import { useSelector } from 'react-redux';
import { themeSelector } from '../selectors/app';
import { useLayoutEffect } from 'react';

const useTheme = () => {
  const theme = useSelector(themeSelector);

  useLayoutEffect(() => {
    const html = document.documentElement;
    if (theme === 'light') {
      html.classList.remove('dark');
      html.classList.add('light');
    } else {
      html.classList.remove('light');
      html.classList.add('dark');
    }
  }, [theme]);
};

export default useTheme;
