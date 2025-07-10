import '../styles/globals.css'; // Import your Tailwind CSS and custom global styles
import '../styles/theme.css'; // Import our theme CSS with colors and fonts
import { ThemeProvider } from '../contexts/ThemeContext';
import { ContentProvider } from '../contexts/ContentContext';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <ContentProvider initialContent={pageProps.initialContent}>
        <Component {...pageProps} />
      </ContentProvider>
    </ThemeProvider>
  );
}

export default MyApp;
