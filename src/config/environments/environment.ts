const envs = import.meta.env;

export default {
  panelBasePath: envs.VITE_BASE_PATH ?? '/',
  serverBaseUrl: envs.VITE_SERVER_BASE_URL,
  tinymceApiKey: envs.VITE_TINYMCE_API_KEY,
  siteTitle: envs.VITE_SITE_TITLE,
  colorTheme: envs.VITE_COLOR_THEME,
  authorizationEnabled: envs.VITE_ENABLE_AUTHORIZATION
};
