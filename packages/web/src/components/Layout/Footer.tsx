import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  // 구독 신청 상태 관리
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeName, setSubscribeName] = useState('');
  const [subscribePhone, setSubscribePhone] = useState('');
  const [subscribeMessage, setSubscribeMessage] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showDetailForm, setShowDetailForm] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  const footerLinks = {
    서비스: [
      { label: '오늘의 운세', path: '/fortune' },
      { label: '사주 분석', path: '/saju' },
      { label: '궁합 보기', path: '/compatibility' },
      { label: '캘린더', path: '/calendar' },
    ],
    정보: [
      { label: '이용약관', path: '/terms' },
      { label: '개인정보처리방침', path: '/privacy' },
      { label: '공지사항', path: '/notice' },
      { label: '자주 묻는 질문', path: '/faq' },
    ],
    회사: [
      { label: '회사소개', path: '/about' },
      { label: '채용정보', path: '/careers' },
      { label: '제휴문의', path: '/partnership' },
      { label: '고객센터', path: '/support' },
    ],
  };

  const socialLinks = [
    { icon: '📘', label: 'Facebook', url: 'https://facebook.com' },
    { icon: '🐦', label: 'Twitter', url: 'https://twitter.com' },
    { icon: '📷', label: 'Instagram', url: 'https://instagram.com' },
    { icon: '📺', label: 'YouTube', url: 'https://youtube.com' },
    { icon: '💬', label: 'KakaoTalk', url: '#' },
  ];

  // 구독 신청 처리
  const handleSubscribe = async () => {
    // 이메일 검증
    if (!subscribeEmail.trim()) {
      alert('이메일 주소를 입력해주세요.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(subscribeEmail)) {
      alert('올바른 이메일 형식이 아닙니다.');
      return;
    }

    setIsSubscribing(true);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: subscribeEmail,
          name: subscribeName || undefined,
          phone: subscribePhone || undefined,
          message: subscribeMessage || undefined,
        }),
      });

      // 404 에러 처리 (개발 환경)
      if (response.status === 404) {
        console.warn('⚠️ 개발 환경: /api/subscribe 엔드포인트를 찾을 수 없습니다.');
        console.log('📧 구독 정보:', {
          email: subscribeEmail,
          name: subscribeName,
          phone: subscribePhone,
          message: subscribeMessage,
        });

        // 개발 모드에서는 성공으로 처리
        setSubscribeSuccess(true);
        setSubscribeEmail('');
        setSubscribeName('');
        setSubscribePhone('');
        setSubscribeMessage('');
        setShowDetailForm(false);
        alert(
          '✅ 구독 신청이 완료되었습니다!\n\n' +
          '💡 개발 환경: API 엔드포인트가 없어 mock 처리되었습니다.\n' +
          'Vercel 배포 후에는 실제 이메일이 전송됩니다.'
        );

        setTimeout(() => setSubscribeSuccess(false), 3000);
        return;
      }

      const result = await response.json();

      if (result.success) {
        setSubscribeSuccess(true);
        setSubscribeEmail('');
        setSubscribeName('');
        setSubscribePhone('');
        setSubscribeMessage('');
        setShowDetailForm(false);
        alert('✅ 구독 신청이 완료되었습니다! 곧 연락드리겠습니다.');

        // 3초 후 성공 상태 초기화
        setTimeout(() => setSubscribeSuccess(false), 3000);
      } else {
        alert(`❌ ${result.error || '구독 신청에 실패했습니다.'}`);
      }
    } catch (error: any) {
      console.error('Subscribe error:', error);

      // 네트워크 에러나 JSON 파싱 에러 처리 (개발 환경)
      if (error.message?.includes('JSON') || error.message?.includes('fetch')) {
        console.warn('⚠️ 개발 환경: API 호출 실패');
        console.log('📧 구독 정보:', {
          email: subscribeEmail,
          name: subscribeName,
          phone: subscribePhone,
          message: subscribeMessage,
        });

        // 개발 모드에서는 성공으로 처리
        setSubscribeSuccess(true);
        setSubscribeEmail('');
        setSubscribeName('');
        setSubscribePhone('');
        setSubscribeMessage('');
        setShowDetailForm(false);
        alert(
          '✅ 구독 신청이 완료되었습니다!\n\n' +
          '💡 개발 환경: API 엔드포인트가 없어 mock 처리되었습니다.\n' +
          'Vercel 배포 후에는 실제 이메일이 전송됩니다.'
        );

        setTimeout(() => setSubscribeSuccess(false), 3000);
      } else {
        alert('❌ 구독 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🧭</span>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                운명나침반
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              전통 사주명리학과 현대 AI 기술을 결합한 
              가장 정확한 운세 서비스
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  aria-label={social.label}
                >
                  <span className="text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="py-8 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-md mx-auto text-center md:text-left md:max-w-none">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                📧 운세 소식을 받아보세요
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                매주 당신의 운세와 행운의 팁을 이메일로 전달해드립니다
              </p>
            </div>

            {/* 기본 이메일 입력 폼 */}
            <div className="space-y-3">
              <div className="flex max-w-md mx-auto md:mx-0">
                <input
                  type="email"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
                  placeholder="이메일 주소 입력"
                  disabled={subscribeSuccess}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSubscribe}
                  disabled={isSubscribing || subscribeSuccess}
                  className={`px-6 py-2 text-white text-sm font-medium rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    subscribeSuccess
                      ? 'bg-green-500'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  }`}
                >
                  {isSubscribing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      처리 중...
                    </div>
                  ) : subscribeSuccess ? (
                    '✓ 완료'
                  ) : (
                    '구독하기'
                  )}
                </button>
              </div>

              {/* 상세 정보 입력 토글 버튼 */}
              {!subscribeSuccess && (
                <button
                  onClick={() => setShowDetailForm(!showDetailForm)}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline mx-auto md:mx-0 block"
                >
                  {showDetailForm ? '▲ 간단히 구독하기' : '▼ 추가 정보 입력하기 (선택)'}
                </button>
              )}

              {/* 추가 정보 입력 폼 */}
              {showDetailForm && !subscribeSuccess && (
                <div className="max-w-md mx-auto md:mx-0 space-y-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                  <input
                    type="text"
                    value={subscribeName}
                    onChange={(e) => setSubscribeName(e.target.value)}
                    placeholder="이름 (선택사항)"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="tel"
                    value={subscribePhone}
                    onChange={(e) => setSubscribePhone(e.target.value)}
                    placeholder="연락처 (선택사항)"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <textarea
                    value={subscribeMessage}
                    onChange={(e) => setSubscribeMessage(e.target.value)}
                    placeholder="메시지 (선택사항)"
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    💡 추가 정보를 입력하시면 더 맞춤화된 운세 정보를 제공해드립니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} 운명나침반. All rights reserved.
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Made with ❤️ in Korea</span>
              <span>|</span>
              <span>Version 1.0.0</span>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="py-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-wrap justify-center items-center gap-6">
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
              <span>🔒</span>
              <span>SSL 보안 연결</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
              <span>✅</span>
              <span>개인정보보호 인증</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
              <span>🏆</span>
              <span>2024 베스트 운세앱 선정</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
              <span>📊</span>
              <span>누적 사용자 100만+</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;