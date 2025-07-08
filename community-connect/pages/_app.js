import '../styles/globals.css'; // Import your Tailwind CSS and custom global styles
import '../styles/theme.css'; // Import our theme CSS with colors and fonts
import { ThemeProvider } from '../contexts/ThemeContext';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
