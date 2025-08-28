import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

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
          <div className="max-w-md mx-auto text-center md:text-left md:max-w-none md:flex md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                운세 소식을 받아보세요
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                매주 당신의 운세와 행운의 팁을 이메일로 전달해드립니다
              </p>
            </div>
            <div className="flex max-w-md mx-auto md:mx-0">
              <input
                type="email"
                placeholder="이메일 주소 입력"
                className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-r-lg hover:from-purple-700 hover:to-pink-700 transition-colors">
                구독하기
              </button>
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