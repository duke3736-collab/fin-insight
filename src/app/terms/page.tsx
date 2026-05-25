export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-8">이용약관</h1>
      <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
        <p><strong>시행일:</strong> 2026년 5월 25일</p>
        
        <section>
          <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-3">제1조 (목적)</h2>
          <p>본 약관은 FinInsight(이하 '본 사이트')가 제공하는 금융 계산기 및 관련 서비스의 이용 조건 및 절차, 이용자와 본 사이트의 권리, 의무, 책임사항 등을 규정함을 목적으로 합니다.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-3">제2조 (서비스의 제공 및 변경)</h2>
          <p>1. 본 사이트는 누구나 무료로 이용할 수 있는 투자 및 생활 계산기 툴킷을 제공합니다.</p>
          <p>2. 본 사이트가 제공하는 계산 결과, 세금 한도, 수수료 등의 정보는 세법 및 금융기관의 정책 변경에 따라 예고 없이 변경될 수 있으며, 항상 최신 정보가 반영되어 있음을 보증하지 않습니다.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-3">제3조 (면책 조항)</h2>
          <p>1. 본 사이트의 계산 결과는 사용자가 직접 입력한 데이터를 바탕으로 한 시뮬레이션이며, 실제 금융 거래 시 발생할 수 있는 세금 및 수수료와 오차가 발생할 수 있습니다.</p>
          <p>2. 본 사이트의 콘텐츠는 정보 제공의 목적으로만 작성되었으며, 투자 권유나 법적/세무적 자문을 대신하지 않습니다.</p>
          <p>3. 사용자가 본 사이트의 정보를 신뢰하여 행한 투자 결과나 재산상 손해에 대해 본 사이트 및 운영자는 어떠한 직간접적인 법적 책임도 지지 않습니다.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-3">제4조 (지적재산권)</h2>
          <p>본 사이트에 포함된 디자인, 코드, UI, 텍스트 등에 대한 저작권 및 지적재산권은 본 사이트 운영자에게 귀속됩니다. 영리 목적으로 무단 복제, 배포, 수정하는 것을 금지합니다.</p>
        </section>
      </div>
    </div>
  );
}
