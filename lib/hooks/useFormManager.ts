// Comprehensive form management hook
// Consolidates form patterns and eliminates duplicate form handling code

import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/app/components/ui/ToastContainer';

export interface FormConfig<T = any> {
  initialValues: T;
  validationSchema?: Record<string, (value: any, formData: T) => string | undefined>;
  onSubmit: (data: T) => Promise<void> | void;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  resetOnSuccess?: boolean;
  showToast?: boolean;
  toastMessages?: {
    success?: string;
    error?: string;
    validation?: string;
  };
}

export interface FormState<T = any> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  submitCount: number;
}

export interface FormActions<T = any> {
  setValue: (name: string, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (name: string, error: string) => void;
  setErrors: (errors: Record<string, string>) => void;
  setTouched: (name: string, touched: boolean) => void;
  setTouchedAll: (touched: boolean) => void;
  reset: (values?: Partial<T>) => void;
  submit: () => Promise<void>;
  validate: (field?: string) => boolean;
  validateAll: () => boolean;
  clearErrors: (field?: string) => void;
  clearAllErrors: () => void;
}

export function useFormManager<T extends Record<string, any>>(
  config: FormConfig<T>
): [FormState<T>, FormActions<T>] {
  const {
    initialValues,
    validationSchema = {},
    onSubmit,
    onSuccess,
    onError,
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
    resetOnSuccess = false,
    showToast = true,
    toastMessages = {}
  } = config;

  const { showToast: showToastMessage } = useToast();

  const [state, setState] = useState<FormState<T>>({
    values: { ...initialValues },
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
    isDirty: false,
    submitCount: 0
  });

  const initialValuesRef = useRef(initialValues);
  const isInitialRender = useRef(true);

  // Update initial values if they change
  useEffect(() => {
    if (!isInitialRender.current) {
      setState(prev => ({
        ...prev,
        values: { ...initialValues },
        errors: {},
        touched: {},
        isDirty: false
      }));
    }
    isInitialRender.current = false;
  }, [initialValues]);

  // Validate a single field
  const validateField = useCallback((name: string, value: any): string | undefined => {
    const validator = validationSchema[name];
    if (!validator) return undefined;
    
    try {
      return validator(value, state.values);
    } catch (error) {
      console.error(`Validation error for field ${name}:`, error);
      return 'Validation error occurred';
    }
  }, [validationSchema, state.values]);

  // Validate all fields
  const validateAll = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    Object.keys(validationSchema).forEach((key) => {
      const value = state.values[key];
      const error = validateField(key, value);
      
      if (error) {
        errors[key] = error;
        isValid = false;
      }
    });

    setState(prev => ({
      ...prev,
      errors,
      isValid
    }));

    return isValid;
  }, [validationSchema, state.values, validateField]);

  // Validate a specific field
  const validate = useCallback((field?: string): boolean => {
    if (field) {
      const error = validateField(field, state.values[field]);
      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [field]: error || ''
        },
        isValid: !error
      }));
      return !error;
    }
    return validateAll();
  }, [validateField, state.values, validateAll]);

  // Set a single value
  const setValue = useCallback((name: string, value: any) => {
    setState(prev => {
      const newValues = { ...prev.values, [name]: value };
      const isDirty = JSON.stringify(newValues) !== JSON.stringify(initialValuesRef.current);
      
      let newErrors = { ...prev.errors };
      if (validateOnChange && validationSchema[name]) {
        const error = validateField(name, value);
        if (error) {
          newErrors[name] = error;
        } else {
          delete newErrors[name];
        }
      }

      return {
        ...prev,
        values: newValues,
        errors: newErrors,
        isDirty,
        isValid: Object.keys(newErrors).length === 0
      };
    });
  }, [validateOnChange, validationSchema, validateField]);

  // Set multiple values
  const setValues = useCallback((values: Partial<T>) => {
    setState(prev => {
      const newValues = { ...prev.values, ...values };
      const isDirty = JSON.stringify(newValues) !== JSON.stringify(initialValuesRef.current);
      
      return {
        ...prev,
        values: newValues,
        isDirty
      };
    });
  }, []);

  // Set a single error
  const setError = useCallback((name: string, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
      isValid: false
    }));
  }, []);

  // Set multiple errors
  const setErrors = useCallback((errors: Record<string, string>) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, ...errors },
      isValid: Object.keys({ ...prev.errors, ...errors }).length === 0
    }));
  }, []);

  // Set touched state for a field
  const setTouched = useCallback((name: string, touched: boolean) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [name]: touched }
    }));
  }, []);

  // Set touched state for all fields
  const setTouchedAll = useCallback((touched: boolean) => {
    setState(prev => {
      const newTouched: Record<string, boolean> = {};
      Object.keys(prev.values).forEach(key => {
        newTouched[key] = touched;
      });
      return {
        ...prev,
        touched: newTouched
      };
    });
  }, []);

  // Reset form
  const reset = useCallback((values?: Partial<T>) => {
    const newValues = values ? { ...initialValues, ...values } : { ...initialValues };
    setState({
      values: newValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
      isDirty: false,
      submitCount: 0
    });
    initialValuesRef.current = newValues;
  }, [initialValues]);

  // Clear errors
  const clearErrors = useCallback((field?: string) => {
    setState(prev => {
      if (field) {
        const newErrors = { ...prev.errors };
        delete newErrors[field];
        return {
          ...prev,
          errors: newErrors,
          isValid: Object.keys(newErrors).length === 0
        };
      }
      return {
        ...prev,
        errors: {},
        isValid: true
      };
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    clearErrors();
  }, [clearErrors]);

  // Submit form
  const submit = useCallback(async () => {
    // Mark all fields as touched
    setTouchedAll(true);

    // Validate on submit if enabled
    if (validateOnSubmit && !validateAll()) {
      if (showToast && toastMessages.validation) {
        showToastMessage({
          type: 'error',
          title: 'Validation Error',
          message: toastMessages.validation
        });
      }
      if (onError) {
        onError('Validation failed');
      }
      return;
    }

    setState(prev => ({
      ...prev,
      isSubmitting: true,
      submitCount: prev.submitCount + 1
    }));

    try {
      await onSubmit(state.values);
      
      if (showToast && toastMessages.success) {
        showToastMessage({
          type: 'success',
          title: 'Success',
          message: toastMessages.success
        });
      }
      
      if (onSuccess) {
        onSuccess(state.values);
      }
      
      if (resetOnSuccess) {
        reset();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      if (showToast && toastMessages.error) {
        showToastMessage({
          type: 'error',
          title: 'Error',
          message: toastMessages.error
        });
      }
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setState(prev => ({
        ...prev,
        isSubmitting: false
      }));
    }
  }, [
    state.values,
    validateOnSubmit,
    validateAll,
    onSubmit,
    onSuccess,
    onError,
    resetOnSuccess,
    reset,
    showToast,
    toastMessages,
    setTouchedAll,
    showToastMessage
  ]);

  const actions: FormActions<T> = {
    setValue,
    setValues,
    setError,
    setErrors,
    setTouched,
    setTouchedAll,
    reset,
    submit,
    validate,
    validateAll,
    clearErrors,
    clearAllErrors
  };

  return [state, actions];
}

// Specialized form hooks for common patterns

export function useFormField<T extends Record<string, any>>(
  formState: FormState<T>,
  formActions: FormActions<T>,
  name: string,
  config?: {
    validateOnBlur?: boolean;
    validateOnChange?: boolean;
  }
) {
  const { validateOnBlur = true, validateOnChange = true } = config || {};

  const value = formState.values[name];
  const error = formState.errors[name];
  const touched = formState.touched[name];

  const onChange = useCallback((newValue: any) => {
    formActions.setValue(name, newValue);
  }, [formActions, name]);

  const onBlur = useCallback(() => {
    if (validateOnBlur) {
      formActions.setTouched(name, true);
      formActions.validate(name);
    }
  }, [validateOnBlur, formActions, name]);

  const onFocus = useCallback(() => {
    formActions.setTouched(name, true);
  }, [formActions, name]);

  return {
    value,
    error,
    touched,
    onChange,
    onBlur,
    onFocus,
    hasError: touched && !!error,
    isValid: touched && !error
  };
}

// Form validation utilities
export const formValidators = {
  required: (value: any): string | undefined => {
    if (value === null || value === undefined || value === '') {
      return 'This field is required';
    }
    return undefined;
  },

  email: (value: string): string | undefined => {
    if (!value) return undefined;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  },

  minLength: (min: number) => (value: string): string | undefined => {
    if (!value) return undefined;
    if (value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return undefined;
  },

  maxLength: (max: number) => (value: string): string | undefined => {
    if (!value) return undefined;
    if (value.length > max) {
      return `Must be no more than ${max} characters`;
    }
    return undefined;
  },

  pattern: (regex: RegExp, message: string) => (value: string): string | undefined => {
    if (!value) return undefined;
    if (!regex.test(value)) {
      return message;
    }
    return undefined;
  },

  number: (value: any): string | undefined => {
    if (value === null || value === undefined || value === '') return undefined;
    if (isNaN(Number(value))) {
      return 'Must be a valid number';
    }
    return undefined;
  },

  min: (min: number) => (value: number): string | undefined => {
    if (value === null || value === undefined) return undefined;
    if (value < min) {
      return `Must be at least ${min}`;
    }
    return undefined;
  },

  max: (max: number) => (value: number): string | undefined => {
    if (value === null || value === undefined) return undefined;
    if (value > max) {
      return `Must be no more than ${max}`;
    }
    return undefined;
  },

  url: (value: string): string | undefined => {
    if (!value) return undefined;
    try {
      new URL(value);
      return undefined;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  phone: (value: string): string | undefined => {
    if (!value) return undefined;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return undefined;
  }
};

// Form field transformers
export const formTransformers = {
  trim: (value: string) => value?.trim(),
  toLowerCase: (value: string) => value?.toLowerCase(),
  toUpperCase: (value: string) => value?.toUpperCase(),
  toNumber: (value: any) => value === '' ? undefined : Number(value),
  toBoolean: (value: any) => Boolean(value),
  removeSpaces: (value: string) => value?.replace(/\s/g, ''),
  capitalize: (value: string) => value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase()
}; 