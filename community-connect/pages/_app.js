import '../styles/globals.css'; // Import your Tailwind CSS and custom global styles
import '../styles/theme.css'; // Import our theme CSS with colors and fonts

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
