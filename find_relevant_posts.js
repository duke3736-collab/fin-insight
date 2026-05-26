const fs = require('fs');

const sitemap1 = fs.readFileSync('/Users/seonglaepark/.gemini/antigravity-ide/brain/68162ae8-d66c-439e-b1d0-2245099454f5/.system_generated/steps/3060/content.md', 'utf8');
const sitemap2 = fs.readFileSync('/Users/seonglaepark/.gemini/antigravity-ide/brain/68162ae8-d66c-439e-b1d0-2245099454f5/.system_generated/steps/3066/content.md', 'utf8');

const regex = /<loc>(.*?)<\/loc>/g;
let match;
const urls = [];

while ((match = regex.exec(sitemap1)) !== null) {
  urls.push(match[1]);
}
while ((match = regex.exec(sitemap2)) !== null) {
  urls.push(match[1]);
}

const decodeUrl = (url) => {
  try { return decodeURIComponent(url); } catch (e) { return url; }
};

const decodedUrls = urls.map(u => ({ url: u, decoded: decodeUrl(u) }));

const findMatches = (keywords) => {
  return decodedUrls.filter(u => keywords.some(k => u.decoded.includes(k))).slice(0, 5).map(u => u.decoded);
};

console.log("apartment-roi:", findMatches(['아파트', '부동산', '주택', '청약']));
console.log("broker-fee:", findMatches(['전월세', '부동산', '임대', '전세']));
console.log("deposit:", findMatches(['파킹통장', '예금', '적금', '금리']));
console.log("goal-tracker:", findMatches(['저축', '통장', '재테크']));
console.log("gold-price:", findMatches(['금시세', '금값']));
console.log("grant-matcher:", findMatches(['청년', '지원금', '보조금']));
console.log("growth-fund:", findMatches(['etf', '펀드', '주식']));
console.log("health-insurance:", findMatches(['건강보험', '건보료']));
console.log("isa:", findMatches(['isa']));
console.log("real-estate-tax:", findMatches(['종부세', '취득세', '재산세']));
console.log("salary:", findMatches(['연말정산', '소득세', '급여', '월급']));
console.log("severance:", findMatches(['퇴직', 'irp']));
console.log("yield-snapshot:", findMatches(['배당', '수익률', '삼성전자']));
console.log("zzantech:", findMatches(['앱테크', '부업', '절약', '이벤트', '쿠폰']));

