---
description: React native created with expo build app for a shopkeeper application
---

# Smart Kirana - Project Rules & Architecture

## 1. Tech Stack
- **Framework:** React Native (Expo Managed Workflow)
- **Language:** TypeScript (.tsx, .ts)
- **Navigation:** Expo Router (File-based routing)
- **Styling:** NativeWind v4 (Tailwind CSS)
- **State Management:** Zustand
- **Icons:** Lucide React Native (preferred) or Expo Icons

## 2. Folder Structure (Feature-Based)
All business logic lives in `src/`. All navigation lives in `app/`.

- `app/` -> **Routes Only**. No complex logic.
  - `_layout.tsx` -> Define Stacks/Tabs here.
  - `index.tsx` -> Entry screens.
- `src/` -> **The "Brain"**.
  - `src/core/` -> Global configs (theme, store, auth state).
  - `src/components/ui/` -> Reusable "dumb" components (Buttons, Inputs).
  - `src/features/` -> Feature-specific logic (e.g., `auth`, `orders`, `printer`).
- `assets/` -> Images and Fonts.

## 3. Navigation Rules (Expo Router)
- **NEVER import screens** into `_layout.tsx`.
  - ❌ `import Login from './login'`
  - ✅ `<Stack.Screen name="login" />` (Let the router find it).
- **Navigation:** Use the hook:
  - `const router = useRouter();`
  - `router.push('/path')`
- **Params:** Use `const { id } = useLocalSearchParams();`

## 4. Styling Rules (NativeWind v4)
- **No Stylesheets:** Avoid `StyleSheet.create({})`. Use Tailwind classes.
- **Syntax:** `<View className="flex-1 bg-white items-center">`
- **Safe Area:** ALWAYS use `SafeAreaView` from `react-native-safe-area-context`, NOT `react-native`.
- **Colors:** Use semantic names defined in `tailwind.config.js` (`bg-primary`, `text-dark`).

## 5. Coding Standards
- **Imports:** ALWAYS use Absolute Paths.
  - ❌ `../../components/Button`
  - ✅ `@/src/components/ui/Button`
- **Components:** Functional components only. Use `export default function Name() {}`.
- **Forms:**
  - If a TextInput changes `keyboardType` dynamically (e.g., switching from Text to Number pad), you MUST add a unique `key` prop to force a re-render.
  - Example: `<TextInput key={mode} keyboardType={mode === 'otp' ? 'numeric' : 'default'} />`

## 6. Critical Fixes (Remember These)
- **Cache Issues:** If you change `babel.config.js` or `tailwind.config.js`, you MUST restart with:
  `npx expo start -c`
- **Layout Imports:** The `_layout.tsx` file must ONLY contain `<Stack>` or `<Tabs>` components. Do not render custom UI inside the return statement of the root layout.

## 7. API Architecture
- **HTTP Client:** `src/core/api/client.ts` — thin `fetch()` wrapper with auth, timeout, and error handling.
- **Config:** `src/core/api/config.ts` — `API_CONFIG` with `BASE_URL`, `TIMEOUT`, default headers.
- **Token Storage:** `src/core/api/tokenStorage.ts` — secure JWT persistence via `expo-secure-store`.
- **Types:** `src/core/api/types.ts` — all shared DTOs, response wrappers, and `ApiError` class.
- **Services:** `src/core/api/services/` — domain-specific modules (`auth`, `inventory`, `orders`, `shop`).
- **Hooks:** `src/core/hooks/` — React hooks wrapping services with loading/error state (`useApi`, `useAuth`, `useInventory`, `useOrders`).
- **Import Pattern:**
  - ✅ `import { authService, ApiError } from '@/src/core/api';`
  - ✅ `import { useAuth } from '@/src/core/hooks/useAuth';`
  - ✅ `import { useApi } from '@/src/core/hooks/useApi';`