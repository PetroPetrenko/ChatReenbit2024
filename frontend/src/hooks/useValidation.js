import { useState } from 'react';

export const useValidation = () => {
  const [errors, setErrors] = useState({});

  const validate = (fields) => {
    const newErrors = {};
    let isValid = true;

    Object.entries(fields).forEach(([fieldName, field]) => {
      const { value, rules } = field;

      if (rules.required && !value) {
        newErrors[fieldName] = 'This field is required';
        isValid = false;
      }

      if (rules.minLength && value.length < rules.minLength) {
        newErrors[fieldName] = `Minimum length is ${rules.minLength}`;
        isValid = false;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        newErrors[fieldName] = `Maximum length is ${rules.maxLength}`;
        isValid = false;
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        newErrors[fieldName] = 'Invalid format';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  return { validate, errors };
};
