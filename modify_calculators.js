const fs = require('fs');
const path = require('path');

const data = {
  'apartment-roi': [
    { title: '강남 아파트 매매 가격 동향', url: 'https://weknews.com/%ea%b0%95%eb%82%a8-%ec%95%84%ed%8c%8c%ed%8a%b8-%eb%a7%a4%eb%a7%a4-%ea%b0%80%ea%b2%a9/' },
    { title: '미리내집 7차 서울 장기전세주택 신청 안내', url: 'https://weknews.com/%eb%af%b8%eb%a6%ac%eb%82%b4%ec%a7%91-7%ec%b0%a8-%ec%84%9c%ec%9a%b8-%ec%9e%a5%ea%b8%b0%ec%a0%84%ec%84%b8%ec%a3%bc%ed%83%9d/' }
  ],
  'broker-fee': [
    { title: '전세자금대출 조건 2025 총정리｜금리 한도 필요서류', url: 'https://weknews.com/%ec%a0%84%ec%84%b8%ec%9e%90%ea%b8%88%eb%8c%80%ec%b6%9c-%ec%a1%b0%ea%b1%b4-2025-%ec%b4%9d%ec%a0%95%eb%a6%ac%ef%bd%9c%ea%b8%88%eb%a6%ac-%ed%95%9c%eb%8f%84-%ed%95%84%ec%9a%94%ec%84%9c%eb%a5%98/' },
    { title: '재개발임대주택 모집 일정 확인하기', url: 'https://weknews.com/%ec%9e%ac%ea%b0%9c%eb%b0%9c%ec%9e%84%eb%8c%80%ec%a3%bc%ed%83%9d-%eb%aa%a8%ec%a7%91-%ec%9d%bc%ec%a0%95/' }
  ],
  'deposit': [
    { title: '파킹통장 금리 비교 완벽 가이드', url: 'https://weknews.com/%ed%8c%8c%ed%82%b9%ed%86%b5%ec%9e%a5-%ea%b8%88%eb%a6%ac-%eb%b9%84%ea%b5%90/' },
    { title: '청년미래적금 은행 추천 TOP6 총정리', url: 'https://weknews.com/%ec%b2%ad%eb%85%84%eb%af%b8%eb%9e%98%ec%a0%81%ea%b8%88-%ec%9d%80%ed%96%89-%ec%b6%94%ec%b2%9c-top6-%ec%b4%9d%ec%a0%95%eb%a6%ac/' }
  ],
  'goal-tracker': [
    { title: '비과세종합저축 대상 가입 방법 총정리', url: 'https://weknews.com/%eb%b9%84%ea%b3%bc%ec%84%b8%ec%a2%85%ed%95%a9%ec%a0%80%ec%b6%95-%eb%8c%80%ec%83%81-%ea%b0%80%ec%9e%85-%eb%b0%a9%eb%b2%95/' },
    { title: '2026 서울시 안심통장 신청방법 및 조건', url: 'https://weknews.com/2026-%ec%84%9c%ec%9a%b8%ec%8b%9c-%ec%95%88%ec%8b%ac%ed%86%b5%ec%9e%a5-%ec%8b%a0%ec%b2%ad%eb%b0%a9%eb%b2%95/' }
  ],
  'gold-price': [
    { title: '2026년 금시세 현황 및 전망 분석', url: 'https://weknews.com/2026%eb%85%84-%ea%b8%88%ec%8b%9c%ec%84%b8/' },
    { title: '안전자산 파킹통장 최고 금리 비교', url: 'https://weknews.com/%ed%8c%8c%ed%82%b9%ed%86%b5%ec%9e%a5-%ea%b8%88%eb%a6%ac-%eb%b9%84%ea%b5%90/' }
  ],
  'grant-matcher': [
    { title: '2026 청년지원금 비수도권 중소기업 대상 안내', url: 'https://weknews.com/2026-%ec%b2%ad%eb%85%84%ec%a7%80%ec%9b%90%ea%b8%88-%eb%b9%84%ec%88%98%eb%8f%84%ea%b6%8c-%ec%a4%91%ec%86%8c%ea%b8%b0%ec%97%85/' },
    { title: '고유가 피해지원금 2차 지급 대상 및 신청', url: 'https://weknews.com/%ea%b3%a0%ec%9c%a0%ea%b0%80-%ed%94%bc%ed%95%b4%ec%a7%80%ec%9b%90%ea%b8%88-2%ec%b0%a8-%ec%a7%80%ea%b8%89-%eb%8c%80%ec%83%81%ec%9d%80/' }
  ],
  'growth-fund': [
    { title: '국민성장펀드 가입 방법 및 혜택 완벽 분석', url: 'https://weknews.com/%ea%b5%ad%eb%af%bc%ec%84%b1%ec%9e%a5%ed%8e%80%eb%93%9c-%ea%b0%80%ec%9e%85-%eb%b0%a9%eb%b2%95/' },
    { title: '연금저축펀드 세액공제 혜택 총정리', url: 'https://weknews.com/%ec%97%b0%ea%b8%88%ec%a0%80%ec%b6%95%ed%8e%80%eb%93%9c-%ec%84%b8%ec%95%a1%ea%b3%b5%ec%a0%9c/' }
  ],
  'health-insurance': [
    { title: '소득 하위 70% 부부 맞벌이 건보료 기준', url: 'https://weknews.com/%ec%86%8c%eb%93%9d-%ed%95%98%ec%9c%84-70-%eb%b6%80%eb%b6%80-%eb%a7%9e%eb%b2%8c%ec%9d%b4-%ea%b1%b4%eb%b3%b4%eb%a3%8c/' },
    { title: '직장가입자 vs 지역가입자 건강보험료 비교', url: 'https://weknews.com/%ea%b3%a0%ec%9c%a0%ea%b0%80-%ec%a7%80%ec%9b%90%ea%b8%88-%ec%a7%81%ec%9e%a5%ea%b0%80%ec%9e%85%ec%9e%90-vs-%ec%a7%80%ec%97%ad%ea%b0%80%ec%9e%85%ec%9e%90/' }
  ],
  'isa': [
    { title: '중개형 ISA 만기일 설정 방법 변경 팁', url: 'https://weknews.com/%ec%a4%91%ea%b0%9c%ed%98%95-isa-%eb%a7%8c%ea%b8%b0%ec%9d%bc-%ec%84%a4%ec%a0%95/' },
    { title: '토스 ISA 계좌 만들기 절세 혜택 및 가입 조건', url: 'https://weknews.com/%ed%86%a0%ec%8a%a4-isa-%ea%b3%84%ec%a2%8c-%eb%a7%8c%eb%93%a4%ea%b8%b0-%ec%a0%88%ec%84%b8-%ed%98%9c%ed%83%9d-%ea%b0%80%ec%9e%85-%ec%a1%b0%ea%b1%b4/' }
  ],
  'real-estate-tax': [
    { title: '부동산 취득세 자동 계산기 사용법', url: 'https://weknews.com/%eb%b6%80%eb%8f%99%ec%82%b0-%ec%b7%a8%eb%93%9d%ec%84%b8-%ea%b3%84%ec%82%b0%ea%b8%b0/' },
    { title: '종합소득세 완벽 계산 및 절세 노하우', url: 'https://weknews.com/%ec%a2%85%ed%95%a9%ec%86%8c%eb%93%9d%ec%84%b8-%ea%b3%84%ec%82%b0%ea%b8%b0/' }
  ],
  'salary': [
    { title: '알바 급여 계산기로 정확한 시급 확인하기', url: 'https://weknews.com/%ec%95%8c%eb%b0%94-%ea%b8%89%ec%97%ac-%ea%b3%84%ec%82%b0%ea%b8%b0/' },
    { title: '2026 종합소득세 신고 필요 서류 총정리', url: 'https://weknews.com/2026-%ec%a2%85%ed%95%a9%ec%86%8c%eb%93%9d%ec%84%b8-%ec%8b%a0%ea%b3%a0-%ec%84%9c%eb%a5%98/' }
  ],
  'severance': [
    { title: '퇴직연금 가입 방법 및 최적 시기 안내', url: 'https://weknews.com/%ed%87%b4%ec%a7%81%ec%97%b0%ea%b8%88-%ea%b0%80%ec%9e%85-%eb%b0%a9%eb%b2%95-%ec%8b%9c%ea%b8%b0/' },
    { title: '숨은 미청구 퇴직연금 조회 및 신청 방법', url: 'https://weknews.com/%eb%af%b8%ec%b2%ad%ea%b5%ac-%ed%87%b4%ec%a7%81%ec%97%b0%ea%b8%88-%ec%a1%b0%ed%9a%8c-%ec%8b%a0%ec%b2%ad/' }
  ],
  'yield-snapshot': [
    { title: '삼성전자 배당금 세금 및 실수령액 계산', url: 'https://weknews.com/%ec%82%bc%ec%84%b1%ec%a0%84%ec%9e%90-%eb%b0%b0%eb%8b%b9%ea%b8%88-%ec%84%b8%ea%b8%88/' },
    { title: '미성년자 해외주식 거래 방법 가이드', url: 'https://weknews.com/%eb%af%b8%ec%84%b1%eb%85%84%ec%9e%90-%ed%95%b4%ec%99%b8%ec%a3%bc%ec%8b%9d-%ea%b1%b0%eb%9e%98/' }
  ],
  'zzantech': [
    { title: '직장인 부업러를 위한 종합소득세 신고 방법', url: 'https://weknews.com/%ec%a7%81%ec%9e%a5%ec%9d%b8-%eb%b6%80%ec%97%85-%ec%a2%85%ec%86%8c%ec%84%b8-%ec%8b%a0%ea%b3%a0/' },
    { title: '반값여행 지역상품권 쿠폰 100% 활용법', url: 'https://weknews.com/%eb%b0%98%ea%b0%92%ec%97%ac%ed%96%89-%ec%a7%80%ec%97%ad%ec%83%81%ed%92%88%ea%b6%8c-%ec%bf%a0%ed%8f%b0/' }
  ]
};

const calcDir = path.join(__dirname, 'src', 'app', 'calculators');

function modifyFile(filepath, slug) {
  let content = fs.readFileSync(filepath, 'utf8');
  
  // Clean existing WordPressLink blocks completely to prevent duplicates
  content = content.replace(/<div className="flex flex-col gap-3 mt-6 pt-6 border-t border-slate-100">[\s\S]*?<\/div>\n\s+<\/section>/g, '</section>');
  content = content.replace(/<div className="flex flex-col gap-3 mt-6 pt-6 border-t border-slate-100">[\s\S]*?<\/div>\n\s+<div className="px-4">/g, '<div className="px-4">');

  const links = data[slug];
  if (!links) return;
  
  const linkString = `\n          <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-slate-100">\n` +
    `            <WordPressLink title="${links[0].title}" url="${links[0].url}" />\n` +
    `            <WordPressLink title="${links[1].title}" url="${links[1].url}" />\n` +
    `          </div>\n        `;
    
  const articleEnd = content.lastIndexOf('</article>');
  if (articleEnd !== -1) {
    const sectionEnd = content.lastIndexOf('</section>', articleEnd);
    if (sectionEnd !== -1) {
      content = content.slice(0, sectionEnd) + linkString + content.slice(sectionEnd);
    }
  } else {
    // For ISA, which doesn't use </article>
    const sectionEnd = content.lastIndexOf('</section>');
    if (sectionEnd !== -1) {
      content = content.slice(0, sectionEnd) + linkString + content.slice(sectionEnd);
    }
  }

  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`Modified: ${slug}`);
}

const folders = fs.readdirSync(calcDir);
for (const folder of folders) {
  const stat = fs.statSync(path.join(calcDir, folder));
  if (stat.isDirectory()) {
    const pagePath = path.join(calcDir, folder, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      modifyFile(pagePath, folder);
    }
  }
}
