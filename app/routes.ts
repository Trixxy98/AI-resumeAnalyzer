import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route('/auth', 'routes/auth.tsx'),
    route('/upload', 'routes/upload.tsx'),
    route('/resume/:id', 'routes/resume.tsx'),
    route('/api/auth/check', 'routes/api.auth.check.ts'),
    route('/api/auth/login', 'routes/api.auth.login.ts'),
    route('/api/auth/signup', 'routes/api.auth.signup.ts'),
    route('/api/auth/logout', 'routes/api.auth.logout.ts'),
    route('/api/resumes', 'routes/api.resumes.ts'),
] satisfies RouteConfig;
