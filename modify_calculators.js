const fs = require('fs');
const path = require('path');

const data = {
  'apartment-roi': [
    { title: '아파트 갭투자 완벽 가이드: 실패하지 않는 매물 고르는 법', url: 'https://weknews.com/apartment-roi-guide' },
    { title: '2026년 기준 다주택자 취득세 중과세율 완벽 정리', url: 'https://weknews.com/real-estate-tax-update' }
  ],
  'broker-fee': [
    { title: '부동산 중개수수료 반값으로 깎는 협상 기술 실전편', url: 'https://weknews.com/broker-fee-negotiation' },
    { title: '전월세 계약 전 반드시 확인해야 할 특약사항 5가지', url: 'https://weknews.com/real-estate-contract-tips' }
  ],
  'deposit': [
    { title: '2026년 예적금 특판 정보 및 최고금리 은행 리스트', url: 'https://weknews.com/high-interest-deposit' },
    { title: '풍차돌리기 적금 100% 성공하는 세팅 방법론', url: 'https://weknews.com/saving-windmill-method' }
  ],
  'goal-tracker': [
    { title: '종잣돈 1억 달성을 위한 현실적인 3단계 로드맵', url: 'https://weknews.com/how-to-save-100-million' },
    { title: '통장 쪼개기로 자동 저축 시스템 만드는 핵심 노하우', url: 'https://weknews.com/bank-account-split' }
  ],
  'gold-price': [
    { title: 'KRX 금시장 vs 골드뱅킹 vs 실물투자 수수료 완벽 비교', url: 'https://weknews.com/gold-investment-comparison' },
    { title: '금값 상승기, 가장 안전하게 금테크 시작하는 가이드', url: 'https://weknews.com/gold-tech-guide' }
  ],
  'grant-matcher': [
    { title: '2026년 청년도약계좌 조건 완화 및 일시납입 신청 방법', url: 'https://weknews.com/youth-account-2026' },
    { title: '나만 모르는 숨은 정부지원금 5가지 찾기 사이트 정리', url: 'https://weknews.com/hidden-government-grants' }
  ],
  'growth-fund': [
    { title: '복리의 마법을 극대화하는 인덱스 펀드 적립식 투자법', url: 'https://weknews.com/compound-interest-fund' },
    { title: '나스닥 S&P500 ETF 투자 수익률 10년 백테스트 결과', url: 'https://weknews.com/snp500-etf-backtest' }
  ],
  'health-insurance': [
    { title: '건강보험료 피부양자 자격 박탈 기준 및 방어 전략', url: 'https://weknews.com/health-insurance-dependent' },
    { title: '프리랜서 및 개인사업자 건강보험료 합법적 절감 노하우', url: 'https://weknews.com/freelancer-health-tax' }
  ],
  'isa': [
    { title: '중개형 ISA 만기일 설정 방법 변경 팁 3분 정리', url: 'https://weknews.com/%ec%a4%91%ea%b0%9c%ed%98%95-isa-%eb%a7%8c%ea%b8%b0%ec%9d%bc-%ec%84%a4%ec%a0%95/' },
    { title: 'ISA 비과세 한도 2배 서민형 전환 조건 및 증빙 서류 발급', url: 'https://weknews.com/isa-seomin-type' }
  ],
  'real-estate-tax': [
    { title: '2026년 종합부동산세 과세 기준 및 1세대 1주택 특례', url: 'https://weknews.com/2026-comprehensive-tax' },
    { title: '재산세 납부 달 완벽 대비: 신용카드 무이자 할부 및 혜택', url: 'https://weknews.com/property-tax-card-benefit' }
  ],
  'salary': [
    { title: '연말정산 소득공제 vs 세액공제 100% 환급받는 완벽 정리', url: 'https://weknews.com/year-end-tax-settlement' },
    { title: '청년내일채움공제 만기 수령액 및 소득세 감면 신청서', url: 'https://weknews.com/youth-tax-reduction' }
  ],
  'severance': [
    { title: '퇴직금 IRP 계좌 이체 시 퇴직소득세 30% 감면 받는 법', url: 'https://weknews.com/irp-severance-pay' },
    { title: '퇴사 전 반드시 확인해야 할 퇴직금 계산 시 평균임금 기준', url: 'https://weknews.com/average-wage-calculation' }
  ],
  'yield-snapshot': [
    { title: '고배당 ETF 포트폴리오로 월 배당금 100만 원 만들기 세팅', url: 'https://weknews.com/dividend-etf-portfolio' },
    { title: '미국 배당주 배당소득세 계산법 및 ISA 연금계좌 활용 팁', url: 'https://weknews.com/us-dividend-tax' }
  ],
  'zzantech': [
    { title: '2026년 하루 5분 투자로 월 10만 원 버는 앱테크 추천 TOP 7', url: 'https://weknews.com/app-tech-recommendation' },
    { title: '무지출 챌린지 성공 확률을 2배 높이는 짠테크 식비 방어전', url: 'https://weknews.com/no-spend-challenge' }
  ]
};

const calcDir = path.join(__dirname, 'src', 'app', 'calculators');

function modifyFile(filepath, slug) {
  let content = fs.readFileSync(filepath, 'utf8');
  
  // 1. Clean existing WordPressLink imports and usage
  content = content.replace(/import\s+WordPressLink\s+from\s+['"]@\/components\/WordPressLink['"];?\n?/g, '');
  
  // Custom cleanup for salary and isa
  content = content.replace(/<WordPressLink[\s\S]*?\/>\s*/g, '');
  
  // 2. Add import at the top (after other imports)
  const importLines = content.split('\n');
  let lastImportIndex = -1;
  for (let i = 0; i < importLines.length; i++) {
    if (importLines[i].startsWith('import ')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex !== -1) {
    importLines.splice(lastImportIndex + 1, 0, 'import WordPressLink from "@/components/WordPressLink";');
  } else {
    importLines.splice(0, 0, 'import WordPressLink from "@/components/WordPressLink";');
  }
  content = importLines.join('\n');
  
  // 3. Find the best place to insert links.
  // We want to insert just before the last </section> which is typically inside <article> or at the end.
  // Let's look for </section> \n </article> or similar.
  const links = data[slug];
  if (!links) return;
  
  const linkString = `\n          <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-slate-100">\n` +
    `            <WordPressLink title="${links[0].title}" url="${links[0].url}" />\n` +
    `            <WordPressLink title="${links[1].title}" url="${links[1].url}" />\n` +
    `          </div>\n        `;
    
  // Try to find the last </section> before </article>
  const articleEnd = content.lastIndexOf('</article>');
  if (articleEnd !== -1) {
    const sectionEnd = content.lastIndexOf('</section>', articleEnd);
    if (sectionEnd !== -1) {
      content = content.slice(0, sectionEnd) + linkString + content.slice(sectionEnd);
    }
  } else {
    // For ISA, which doesn't use </article>
    const shareEnd = content.lastIndexOf('</section>');
    if (shareEnd !== -1) {
      content = content.slice(0, shareEnd) + linkString + content.slice(shareEnd);
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
