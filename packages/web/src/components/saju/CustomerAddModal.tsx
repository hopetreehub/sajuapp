import { useState, useEffect, useCallback } from 'react';
import { createCustomer, Customer } from '@/services/customerApi';

interface CustomerAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerAdded: (customer: Customer) => void;
}

interface FormData {
  name: string;
  birth_date: string;
  birth_time: string;
  phone: string;
  lunar_solar: 'lunar' | 'solar';
  gender: 'male' | 'female';
  memo: string;
}

interface FormErrors {
  name?: string;
  birth_date?: string;
  birth_time?: string;
  phone?: string;
}

export default function CustomerAddModal({
  isOpen,
  onClose,
  onCustomerAdded,
}: CustomerAddModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    birth_date: '',
    birth_time: '',
    phone: '',
    lunar_solar: 'solar',
    gender: 'male',
    memo: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // 모달이 열릴 때마다 폼 초기화
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]); // resetForm은 컴포넌트 함수로 안정적이므로 의존성에서 제외

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  // 폼 데이터 초기화
  const resetForm = () => {
    setFormData({
      name: '',
      birth_date: '',
      birth_time: '',
      phone: '',
      lunar_solar: 'solar',
      gender: 'male',
      memo: '',
    });
    setErrors({});
    setSubmitMessage(null);
  };

  // 폼 유효성 검증
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 이름 검증
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    } else if (formData.name.length < 2) {
      newErrors.name = '이름은 2자 이상 입력해주세요';
    }

    // 생년월일 검증
    if (!formData.birth_date) {
      newErrors.birth_date = '생년월일을 선택해주세요';
    } else {
      const birthDate = new Date(formData.birth_date);
      const today = new Date();
      const minDate = new Date(1900, 0, 1);

      if (birthDate > today) {
        newErrors.birth_date = '미래 날짜는 선택할 수 없습니다';
      } else if (birthDate < minDate) {
        newErrors.birth_date = '1900년 이후 날짜를 선택해주세요';
      }
    }

    // 생시 검증
    if (!formData.birth_time) {
      newErrors.birth_time = '생시를 선택해주세요';
    }

    // 전화번호 검증
    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요';
    } else {
      const phoneRegex = /^010-\d{4}-\d{4}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 전화번호 자동 포맷팅
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');

    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // 폼 필드 변경 핸들러
  const handleFieldChange = (field: keyof FormData, value: string) => {
    if (field === 'phone') {
      value = formatPhoneNumber(value);
    }

    setFormData(prev => ({ ...prev, [field]: value }));

    // 에러 메시지 클리어
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // 성공/에러 메시지 클리어
    if (submitMessage) {
      setSubmitMessage(null);
    }
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const customerData: Customer = {
        name: formData.name.trim(),
        birth_date: formData.birth_date,
        birth_time: formData.birth_time,
        phone: formData.phone,
        lunar_solar: formData.lunar_solar,
        gender: formData.gender,
        memo: formData.memo.trim(),
      };

      const response = await createCustomer(customerData);

      setSubmitMessage({
        type: 'success',
        text: '고객이 성공적으로 등록되었습니다!',
      });

      // 0.5초 후 모달 닫기 및 성공 콜백 호출
      setTimeout(() => {
        onCustomerAdded(response.data);
        handleClose();
      }, 500);

    } catch (error: unknown) {
      console.error('고객 등록 실패:', error);
      setSubmitMessage({
        type: 'error',
        text: (error instanceof Error ? error.message : '고객 등록 중 오류가 발생했습니다'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 닫기
  const handleClose = useCallback(() => {
    if (isSubmitting) return; // 제출 중에는 닫기 방지
    resetForm();
    onClose();
  }, [isSubmitting, onClose]);

  // 모달 배경 클릭 시 닫기
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 id="modal-title" className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">👤</span>
              새 고객 등록
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
              aria-label="모달 닫기"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                <span className="text-red-500">*</span> 이름
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl transition-colors
                  ${errors.name
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }
                  dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2`}
                placeholder="고객 이름을 입력하세요"
                disabled={isSubmitting}
                autoComplete="name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* 생년월일 */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                <span className="text-red-500">*</span> 생년월일
              </label>
              <input
                type="date"
                value={formData.birth_date}
                onChange={(e) => handleFieldChange('birth_date', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                min="1900-01-01"
                className={`w-full px-4 py-3 border rounded-xl transition-colors
                  ${errors.birth_date
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }
                  dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2`}
                disabled={isSubmitting}
              />
              {errors.birth_date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.birth_date}</p>
              )}
            </div>

            {/* 생시 */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                <span className="text-red-500">*</span> 생시 (24시간 형식)
              </label>
              <input
                type="time"
                value={formData.birth_time}
                onChange={(e) => handleFieldChange('birth_time', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl transition-colors
                  ${errors.birth_time
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }
                  dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2`}
                disabled={isSubmitting}
              />
              {errors.birth_time && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.birth_time}</p>
              )}
            </div>

            {/* 전화번호 */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                <span className="text-red-500">*</span> 전화번호
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl transition-colors
                  ${errors.phone
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }
                  dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2`}
                placeholder="010-1234-5678"
                disabled={isSubmitting}
                autoComplete="tel"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
              )}
            </div>

            {/* 음력/양력 */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                음력/양력
              </label>
              <div className="flex gap-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="solar"
                    checked={formData.lunar_solar === 'solar'}
                    onChange={() => handleFieldChange('lunar_solar', 'solar')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">🌞 양력</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="lunar"
                    checked={formData.lunar_solar === 'lunar'}
                    onChange={() => handleFieldChange('lunar_solar', 'lunar')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">🌙 음력</span>
                </label>
              </div>
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                <span className="text-red-500">*</span> 성별
              </label>
              <div className="flex gap-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={() => handleFieldChange('gender', 'male')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">👨 남성</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={() => handleFieldChange('gender', 'female')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">👩 여성</span>
                </label>
              </div>
            </div>

            {/* 메모 */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                메모
              </label>
              <textarea
                value={formData.memo}
                onChange={(e) => handleFieldChange('memo', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                         dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                placeholder="고객에 대한 추가 정보를 입력하세요 (선택사항)"
                disabled={isSubmitting}
              />
            </div>

            {/* 성공/에러 메시지 */}
            {submitMessage && (
              <div className={`p-4 rounded-xl text-sm font-medium ${
                submitMessage.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {submitMessage.type === 'success' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {submitMessage.text}
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300
                       rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl
                       hover:from-blue-700 hover:to-blue-800 transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  등록 중...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  등록하기
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}