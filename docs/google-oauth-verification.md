# Google OAuth Verification — Guía para Producción

> Aplicar antes de solicitar la verificación de Google en cualquier dominio de producción.

---

## Problemas que detectó Google y cómo se resolvieron

| # | Problema | Solución aplicada |
|---|---|---|
| 1 | Homepage no incluye link a Política de Privacidad | `LoginView.tsx` refactorizado como landing page con links visibles |
| 2 | URL de privacidad = URL de homepage | Configurar URLs diferentes en Google Cloud Console (ver abajo) |
| 3 | Homepage protegida por login | `LoginView` ahora muestra contenido público antes de autenticarse |
| 4 | Homepage no explica el propósito de la app | Panel izquierdo del login explica features y propósito de Dental Dash |
| 5 | Nombre de app no coincide ("Dental-test" vs "Dental Dash") | Corregir en Google Cloud Console (ver abajo) |

---

## Checklist de Google Cloud Console

Ir a: **[console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → OAuth consent screen**

Verificar que estos campos tengan exactamente estos valores (adaptados al dominio de producción):

```
Application name:       Dental Dash
Homepage URL:           https://<tu-dominio-produccion>/
Privacy Policy URL:     https://<tu-dominio-produccion>/privacy
Terms of Service URL:   https://<tu-dominio-produccion>/terms
```

> ⚠️ **Homepage URL** y **Privacy Policy URL** deben ser URLs diferentes.  
> El error más común es tener el mismo valor en ambos campos.

---

## Scopes de Google que requieren verificación

Estos dos scopes son **Sensitive** y requieren verificación por Google:

| Scope | Uso en la app |
|---|---|
| `auth/calendar` | Crear/editar/eliminar turnos en Google Calendar del usuario |
| `auth/drive.file` | Guardar historias clínicas PDF en el Google Drive del usuario |

La **Política de Privacidad** (`/privacy`) ya documenta ambos scopes. No modificar esas secciones.

---

## Rutas públicas (sin autenticación)

Estas rutas deben ser accesibles sin login para que Google las pueda indexar:

| Ruta | Archivo |
|---|---|
| `/` | `LoginView.tsx` (landing page pública) |
| `/privacy` | `PrivacyPolicy.tsx` |
| `/terms` | `TermsOfService.tsx` |

Están declaradas en `App.tsx` fuera del guard de sesión. **No envolver con `ProtectedRoute`.**

---

## Al cambiar de dominio (ej: de `dental-test.intux.solutions` a producción)

1. Actualizar las URLs en Google Cloud Console (ver arriba).
2. Actualizar la variable `redirectTo` si está hardcodeada en `LoginView.tsx` (actualmente usa `window.location.origin`, es dinámico ✅).
3. Agregar el nuevo dominio en **Supabase → Authentication → URL Configuration → Redirect URLs**.
4. Re-solicitar verificación a Google con las nuevas URLs.
