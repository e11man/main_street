import { homepageContent } from './homepage.js';
import { aboutContent } from './about.js';
import { navigationContent } from './navigation.js';
import { footerContent } from './footer.js';
import { commonContent } from './common.js';
import { modalsContent } from './modals.js';
import { dashboardContent } from './dashboard.js';

// Export all content as a single object
export const staticContent = {
  homepage: homepageContent,
  about: aboutContent,
  navigation: navigationContent,
  footer: footerContent,
  common: commonContent,
  modals: modalsContent,
  dashboard: dashboardContent
};

// Export individual sections for direct imports
export {
  homepageContent,
  aboutContent,
  navigationContent,
  footerContent,
  commonContent,
  modalsContent,
  dashboardContent
};