// src/utils/validation.ts

// Define error types
export interface FormErrors {
    [key: string]: string;
  }
  
  // Validate email
  export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Validate phone number
  export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9+\-\s()]{8,15}$/;
    return phoneRegex.test(phone);
  };
  
  // Validate required field
  export const validateRequired = (value: string): boolean => {
    return value.trim().length > 0;
  };
  
  // Validate date format (DD/MM/YYYY)
  export const validateDate = (date: string): boolean => {
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    return dateRegex.test(date);
  };
  
  // Validate year format (YYYY)
  export const validateYear = (year: string): boolean => {
    const yearRegex = /^\d{4}$/;
    const currentYear = new Date().getFullYear();
    const yearNumber = parseInt(year, 10);
    return yearRegex.test(year) && yearNumber > 1900 && yearNumber <= currentYear + 10;
  };
  
  // Validate numeric field
  export const validateNumeric = (value: string): boolean => {
    const numericRegex = /^[0-9]*\.?[0-9]+$/;
    return numericRegex.test(value);
  };
  
  // Job Application form validation
  export const validateJobApplicationForm = (formData: any): FormErrors => {
    const errors: FormErrors = {};
    
    if (!validateRequired(formData.name)) {
      errors.name = 'Nama wajib diisi';
    }
    
    if (!validateRequired(formData.address)) {
      errors.address = 'Alamat wajib diisi';
    }
    
    if (!validateRequired(formData.phone)) {
      errors.phone = 'Nomor telepon wajib diisi';
    } else if (!validatePhone(formData.phone)) {
      errors.phone = 'Format nomor telepon tidak valid';
    }
    
    if (!validateRequired(formData.email)) {
      errors.email = 'Email wajib diisi';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Format email tidak valid';
    }
    
    if (!validateRequired(formData.companyName)) {
      errors.companyName = 'Nama perusahaan wajib diisi';
    }
    
    if (!validateRequired(formData.position)) {
      errors.position = 'Posisi wajib diisi';
    }
    
    return errors;
  };
  
  // CV form validation
  export const validateCVForm = (formData: any): FormErrors => {
    const errors: FormErrors = {};
    
    if (!validateRequired(formData.name)) {
      errors.name = 'Nama wajib diisi';
    }
    
    if (!validateRequired(formData.address)) {
      errors.address = 'Alamat wajib diisi';
    }
    
    if (!validateRequired(formData.phone)) {
      errors.phone = 'Nomor telepon wajib diisi';
    } else if (!validatePhone(formData.phone)) {
      errors.phone = 'Format nomor telepon tidak valid';
    }
    
    if (!validateRequired(formData.email)) {
      errors.email = 'Email wajib diisi';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Format email tidak valid';
    }
    
    if (formData.linkedin && !formData.linkedin.includes('linkedin.com')) {
      errors.linkedin = 'URL LinkedIn tidak valid';
    }
    
    if (!validateRequired(formData.university)) {
      errors.university = 'Universitas/Institusi wajib diisi';
    }
    
    if (!validateRequired(formData.yearStart)) {
      errors.yearStart = 'Tahun mulai wajib diisi';
    } else if (!validateYear(formData.yearStart)) {
      errors.yearStart = 'Format tahun tidak valid';
    }
    
    if (!validateRequired(formData.yearEnd)) {
      errors.yearEnd = 'Tahun selesai wajib diisi';
    } else if (!validateYear(formData.yearEnd)) {
      errors.yearEnd = 'Format tahun tidak valid';
    } else if (parseInt(formData.yearStart) > parseInt(formData.yearEnd)) {
      errors.yearEnd = 'Tahun selesai harus setelah tahun mulai';
    }
    
    if (formData.gpa && !validateNumeric(formData.gpa)) {
      errors.gpa = 'IPK harus berupa angka';
    }
    
    return errors;
  };
  
  // Resignation form validation
  export const validateResignationForm = (formData: any, selectedReasons: string[]): FormErrors => {
    const errors: FormErrors = {};
    
    if (!validateRequired(formData.name)) {
      errors.name = 'Nama wajib diisi';
    }
    
    if (!validateRequired(formData.position)) {
      errors.position = 'Posisi/Jabatan wajib diisi';
    }
    
    if (!validateRequired(formData.companyName)) {
      errors.companyName = 'Nama perusahaan wajib diisi';
    }
    
    if (!validateRequired(formData.lastWorkingDate)) {
      errors.lastWorkingDate = 'Tanggal terakhir bekerja wajib diisi';
    } else if (!validateDate(formData.lastWorkingDate)) {
      errors.lastWorkingDate = 'Format tanggal harus DD/MM/YYYY';
    }
    
    if (selectedReasons.length === 0) {
      errors.reasons = 'Pilih minimal satu alasan pengunduran diri';
    }
    
    if (selectedReasons.includes('other') && !validateRequired(formData.otherReason)) {
      errors.otherReason = 'Alasan lainnya wajib diisi';
    }
    
    return errors;
  };