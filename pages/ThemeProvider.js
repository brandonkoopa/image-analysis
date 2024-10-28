import { createContext, useContext } from 'react';
import theme from './theme'; // Import the theme

const ThemeContext = createContext(theme);

export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme in any component
export const useTheme = () => useContext(ThemeContext);