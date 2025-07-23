export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validateField = (value: any, rule: ValidationRule): string | null => {
  if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return 'هذا الحقل مطلوب';
  }

  if (value && typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      return `يجب أن يكون الحد الأدنى ${rule.minLength} أحرف`;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return `يجب أن يكون الحد الأقصى ${rule.maxLength} أحرف`;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return 'تنسيق غير صحيح';
    }
  }

  if (value && typeof value === 'number') {
    if (rule.min !== undefined && value < rule.min) {
      return `يجب أن يكون أكبر من أو يساوي ${rule.min}`;
    }

    if (rule.max !== undefined && value > rule.max) {
      return `يجب أن يكون أصغر من أو يساوي ${rule.max}`;
    }
  }

  if (rule.custom) {
    return rule.custom(value);
  }

  return null;
};

export const validateForm = (data: any, rules: ValidationRules): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach(field => {
    const error = validateField(data[field], rules[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^05\d{8}$/,
  arabicText: /^[\u0600-\u06FF\s]+$/,
  price: /^\d+(\.\d{1,2})?$/,
};

// Common validation rules
export const commonRules = {
  required: { required: true },
  email: { required: true, pattern: patterns.email },
  phone: { pattern: patterns.phone },
  price: { required: true, min: 0, pattern: patterns.price },
  arabicName: { required: true, minLength: 2, maxLength: 50, pattern: patterns.arabicText },
};