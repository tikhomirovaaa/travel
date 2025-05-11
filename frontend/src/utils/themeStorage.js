export const getSavedTheme = () => {
    return localStorage.getItem('themeMode') || 'light';
  };
  
  export const saveTheme = (mode) => {
    localStorage.setItem('themeMode', mode);
  };