# react-hook-form-discriminated

Type-safe utilities for working with discriminated union forms in React Hook Form.

## Installation

```bash
npm install react-hook-form-discriminated
# or
pnpm add react-hook-form-discriminated
# or
yarn add react-hook-form-discriminated
```

## Usage

### `useFormTypeguard`

Create runtime type guards for forms with different shapes based on discriminant values.

```typescript
import { useForm } from 'react-hook-form';
import { useFormTypeguard } from 'react-hook-form-discriminated';

type FormValues =
  | { type: 'user'; name: string; email: string }
  | { type: 'admin'; name: string; permissions: string[] };

function MyComponent() {
  const form = useForm<FormValues>();

  // Type guard for admin forms
  const isAdminForm = useFormTypeguard(form, { type: 'admin' });

  if (isAdminForm) {
    // form is now typed as UseFormReturn<{ type: 'admin'; name: string; permissions: string[] }>
    const permissions = form.getValues('permissions'); // ✅ Type-safe
  }

  return (
    <div>
      {isAdminForm && <AdminPanel form={form} />}
      {!isAdminForm && <UserPanel form={form} />}
    </div>
  );
}
```

### `createDiscriminatedFormCtx`

Create typed form context hooks for discriminated forms.

```typescript
import { useForm } from 'react-hook-form';
import { createDiscriminatedFormCtx } from 'react-hook-form-discriminated';

type FormValues =
  | { type: 'login'; email: string; password: string }
  | { type: 'register'; email: string; password: string; confirmPassword: string };

// Create a typed form context hook
const useForm = createDiscriminatedFormCtx<FormValues, 'type'>();

function LoginForm() {
  const { register } = useForm<'login'>();
  // TypeScript knows this is a login form
  return <input {...register('email')} type="email" />;
}

function RegisterForm() {
  const { register } = useForm<'register'>();
  return (
    <div>
      <input {...register('email')} type="email" />
      <input {...register('confirmPassword')} type="password" />
    </div>
  );
}
```

## API

### `useFormTypeguard(form, discriminant)`

- `form`: React Hook Form instance or union of forms
- `discriminant`: Object with field paths and expected values to match
- Returns: Type guard boolean

### `createDiscriminatedFormCtx<TFormValues, TDiscriminantKey>()`

- Returns a hook factory that creates typed form context hooks
- Use with a specific discriminant value for type narrowing

## License

MIT