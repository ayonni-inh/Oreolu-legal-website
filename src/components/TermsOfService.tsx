export default function TermsOfService({ onNavigate }: { onNavigate?: (page: string) => void }) {
  return (
    <div className="pt-10 pb-20 px-6 lg:px-8 max-w-4xl mx-auto">
      <h1 className="font-serif text-4xl font-bold text-navy mb-6">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last Updated: March 16, 2026</p>
      
      <div className="prose prose-navy max-w-none text-gray-600 space-y-6">
        <section>
          <h2 className="font-serif text-2xl font-bold text-navy mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing and using the OROELU GODWIN AGIDI & CO client portal and website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-navy mb-3">2. Provision of Services</h2>
          <p>
            OROELU GODWIN AGIDI & CO provides legal consultation, document review, and representation services as outlined in specific retainer agreements. The information provided on this website does not, and is not intended to, constitute legal advice; instead, all information, content, and materials available on this site are for general informational purposes only.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-navy mb-3">3. Client Portal Usage</h2>
          <p>
            You are responsible for maintaining the confidentiality of your portal login information and are fully responsible for all activities that occur under your password or account. You agree to immediately notify OROELU GODWIN AGIDI & CO of any unauthorized use of your password or account or any other breach of security.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-navy mb-3">4. Privacy Policy</h2>
          <p>
            Our Privacy Policy, which sets out how we will use your information, can be found in our dedicated 
            <button 
              onClick={() => onNavigate?.('privacy-policy')}
              className="text-gold hover:underline font-bold ml-1"
            >
              Privacy Policy section
            </button>. 
            By using this Website, you consent to the processing described therein and warrant that all data provided by you is accurate.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-navy mb-3">5. Modifications</h2>
          <p>
            OROELU GODWIN AGIDI & CO reserves the right to modify these Terms of Service at any time. We do so by posting and drawing attention to the updated terms on the Site. Your decision to continue to visit and make use of the Site after such changes have been made constitutes your formal acceptance of the new Terms of Service.
          </p>
        </section>
      </div>
    </div>
  );
}
