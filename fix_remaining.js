const fs = require('fs');
const path = require('path');

const data = {
  'goal-tracker': [
    { title: '비과세종합저축 대상 가입 방법 총정리', url: 'https://weknews.com/%eb%b9%84%ea%b3%bc%ec%84%b8%ec%a2%85%ed%95%a9%ec%a0%80%ec%b6%95-%eb%8c%80%ec%83%81-%ea%b0%80%ec%9e%85-%eb%b0%a9%eb%b2%95/' },
    { title: '2026 서울시 안심통장 신청방법 및 조건', url: 'https://weknews.com/2026-%ec%84%9c%ec%9a%b8%ec%8b%9c-%ec%95%88%ec%8b%ac%ed%86%b5%ec%9e%a5-%ec%8b%a0%ec%b2%ad%eb%b0%a9%eb%b2%95/' }
  ],
  'grant-matcher': [
    { title: '2026 청년지원금 비수도권 중소기업 대상 안내', url: 'https://weknews.com/2026-%ec%b2%ad%eb%85%84%ec%a7%80%ec%9b%90%ea%b8%88-%eb%b9%84%ec%88%98%eb%8f%84%ea%b6%8c-%ec%a4%91%ec%86%8c%ea%b8%b0%ec%97%85/' },
    { title: '고유가 피해지원금 2차 지급 대상 및 신청', url: 'https://weknews.com/%ea%b3%a0%ec%9c%a0%ea%b0%80-%ed%94%bc%ed%95%b4%ec%a7%80%ec%9b%90%ea%b8%88-2%ec%b0%a8-%ec%a7%80%ea%b8%89-%eb%8c%80%ec%83%81%ec%9d%80/' }
  ],
  'health-insurance': [
    { title: '소득 하위 70% 부부 맞벌이 건보료 기준', url: 'https://weknews.com/%ec%86%8c%eb%93%9d-%ed%95%98%ec%9c%84-70-%eb%b6%80%eb%b6%80-%eb%a7%9e%eb%b2%8c%ec%9d%b4-%ea%b1%b4%eb%b3%b4%eb%a3%8c/' },
    { title: '직장가입자 vs 지역가입자 건강보험료 비교', url: 'https://weknews.com/%ea%b3%a0%ec%9c%a0%ea%b0%80-%ec%a7%80%ec%9b%90%ea%b8%88-%ec%a7%81%ec%9e%a5%ea%b0%80%ec%9e%85%ec%9e%90-vs-%ec%a7%80%ec%97%ad%ea%b0%80%ec%9e%85%ec%9e%90/' }
  ]
};

const calcDir = path.join(__dirname, 'src', 'app', 'calculators');

function modifyFile(filepath, slug) {
  let content = fs.readFileSync(filepath, 'utf8');
  
  if (content.includes('<WordPressLink')) {
      console.log(`Skipping: ${slug} (already has links)`);
      return;
  }

  const links = data[slug];
  if (!links) return;
  
  const linkString = `\n      <article className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mt-12 space-y-8">\n` +
                     `        <section>\n` +
                     `          <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-slate-100">\n` +
                     `            <WordPressLink title="${links[0].title}" url="${links[0].url}" />\n` +
                     `            <WordPressLink title="${links[1].title}" url="${links[1].url}" />\n` +
                     `          </div>\n` +
                     `        </section>\n` +
                     `      </article>\n`;

  // These three files end with `</div>\n  );\n}`
  const insertIndex = content.lastIndexOf('    </div>');
  if (insertIndex !== -1) {
      content = content.slice(0, insertIndex) + linkString + content.slice(insertIndex);
      fs.writeFileSync(filepath, content, 'utf8');
      console.log(`Modified: ${slug}`);
  } else {
      console.log(`Could not find insertion point for: ${slug}`);
  }
}

for (const slug of Object.keys(data)) {
    modifyFile(path.join(calcDir, slug, 'page.tsx'), slug);
}
