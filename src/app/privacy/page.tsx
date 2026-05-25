export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-8">개인정보처리방침</h1>
      <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
        <p><strong>시행일:</strong> 2026년 5월 25일</p>
        
        <section>
          <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-3">1. 개인정보의 처리 목적</h2>
          <p>FinInsight(이하 '본 사이트')는 사용자의 금융 계산 편의를 돕는 도구를 제공합니다. 본 사이트의 모든 계산기는 사용자의 웹 브라우저 내에서만 동작하며, 입력하신 어떠한 금융 정보(원금, 수익금 등)나 개인정보도 서버로 전송되거나 수집되지 않습니다.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-3">2. 쿠키 및 광고 식별자 수집</h2>
          <p>본 사이트는 서비스 개선 및 구글 애드센스(Google AdSense)와 같은 타사 광고 게재를 위해 쿠키(Cookie) 및 익명의 식별자를 사용할 수 있습니다. 구글 및 파트너는 쿠키를 사용하여 사용자의 과거 방문 기록을 기반으로 맞춤형 광고를 게재합니다.</p>
          <ul className="list-disc pl-5 mt-2">
            <li>사용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.</li>
            <li>구글의 광고 설정 페이지에서 맞춤형 광고를 선택 해제할 수 있습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-3">3. 이용자 권리 및 행사 방법</h2>
          <p>본 사이트는 회원가입 시스템을 운영하지 않으며, 어떠한 개인정보도 보유하지 않으므로 파기할 개인정보가 존재하지 않습니다.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-3">4. 책임 한계 및 고지사항</h2>
          <p>본 사이트에서 제공하는 계산 결과는 단순 참고용이며, 실제 금융기관의 세금 계산 및 정책과 다를 수 있습니다. 이를 바탕으로 한 투자 및 금융 결정에 대해 본 사이트는 어떠한 법적 책임도 지지 않습니다.</p>
        </section>
      </div>
    </div>
  );
}
