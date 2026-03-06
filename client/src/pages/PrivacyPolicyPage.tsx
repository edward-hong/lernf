export function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Disclaimer banner */}
      <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          This document is a draft and has not been reviewed by a legal
          professional.
        </p>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: March 2026</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <Section title="1. Introduction">
          <p>
            This Privacy Policy describes how Lernf (&ldquo;the Service,&rdquo;
            &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;),
            operated by Edward Hong and available at lernf.com, collects, uses,
            stores, and protects your personal information. We are based in New
            Zealand and comply with the New Zealand Privacy Act 2020 and the
            European Union General Data Protection Regulation (GDPR) where
            applicable.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
            2.1 Account Information
          </h3>
          <p>When you create an account, we collect:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Email address</li>
            <li>First and last name (if provided)</li>
            <li>
              Authentication data managed by Clerk (our authentication provider)
            </li>
          </ul>

          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
            2.2 Payment Information
          </h3>
          <p>
            When you subscribe to a paid plan, payment processing is handled by
            Stripe. We do not directly collect or store your credit card number.
            Stripe collects:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Payment card details</li>
            <li>Billing address</li>
            <li>Transaction history</li>
          </ul>
          <p className="mt-2">
            For more information, see{' '}
            <a
              href="https://stripe.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Stripe&apos;s privacy policy
            </a>
            .
          </p>

          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
            2.3 API Keys
          </h3>
          <p>
            If you use the free tier, you may provide API keys for third-party
            AI providers. These keys are stored on our servers to enable the
            Service&apos;s functionality.
          </p>

          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
            2.4 Usage Data
          </h3>
          <p>
            We collect information about how you interact with the Service,
            including:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Features accessed and scenarios completed</li>
            <li>
              AI interaction data (prompts and responses processed through the
              Service)
            </li>
            <li>Token usage and consumption metrics</li>
            <li>Session duration and frequency of use</li>
          </ul>

          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
            2.5 Technical Data
          </h3>
          <p>We automatically collect:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device type</li>
            <li>Operating system</li>
            <li>Referring URLs</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use your information to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Provide and maintain the Service</li>
            <li>Process subscriptions and payments</li>
            <li>Authenticate your identity</li>
            <li>
              Facilitate AI interactions using your API keys or included credits
            </li>
            <li>Generate GRIP assessments and behavioral analysis</li>
            <li>Monitor token usage and enforce plan limits</li>
            <li>
              Communicate with you about your account, updates, or support
              requests
            </li>
            <li>Improve the Service and develop new features</li>
            <li>Ensure security and prevent abuse</li>
          </ul>
        </Section>

        <Section title="4. Legal Basis for Processing (GDPR)">
          <p>
            For users in the European Economic Area (EEA), we process personal
            data under the following legal bases:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Contract:</strong> Processing necessary to provide the
              Service you signed up for
            </li>
            <li>
              <strong>Legitimate interest:</strong> Analytics, security, and
              service improvement
            </li>
            <li>
              <strong>Consent:</strong> Where we request your explicit consent
              for specific processing activities
            </li>
          </ul>
        </Section>

        <Section title="5. Data Sharing">
          <p>
            We do not sell your personal information. We share data only with
            the following categories of third-party service providers, who
            process data on our behalf:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Clerk</strong> (authentication): Processes your account
              and authentication data.{' '}
              <a
                href="https://clerk.com/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Privacy policy
              </a>
            </li>
            <li>
              <strong>Stripe</strong> (payments): Processes your payment
              information.{' '}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Privacy policy
              </a>
            </li>
            <li>
              <strong>Encore Cloud</strong> (backend hosting): Hosts our backend
              infrastructure
            </li>
            <li>
              <strong>Vercel</strong> (frontend hosting): Hosts our frontend
              application.{' '}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Privacy policy
              </a>
            </li>
            <li>
              <strong>Third-party AI providers</strong> (when using the
              Service): Your prompts and interactions are sent to AI providers
              (such as OpenAI, Anthropic, Google, or DeepSeek) based on your
              configuration. These providers have their own privacy policies
              governing how they handle data.
            </li>
          </ul>
          <p className="mt-2">
            We may also disclose your information if required by law, regulation,
            or legal process, or to protect the rights, safety, or property of
            ourselves or others.
          </p>
        </Section>

        <Section title="6. AI Interaction Data">
          <p>
            When you use the Service, your prompts and AI responses are
            processed to provide features such as intent analysis, scenario
            training, and behavioral assessments. We want you to understand:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              Prompts are sent to third-party AI providers to generate responses
            </li>
            <li>
              If you use your own API keys, interactions are governed by your
              agreement with that AI provider
            </li>
            <li>
              If you use included credits on a paid plan, interactions are
              processed through our accounts with AI providers
            </li>
            <li>
              We may analyse aggregated, anonymised interaction patterns to
              improve the Service, but we do not share individually identifiable
              AI interaction data with third parties
            </li>
          </ul>
        </Section>

        <Section title="7. Data Storage and Security">
          <ul className="list-disc pl-5 space-y-1">
            <li>Your data is stored on servers managed by Encore Cloud</li>
            <li>API keys are stored with encryption measures in place</li>
            <li>
              We implement industry-standard security practices including HTTPS
              encryption, access controls, and regular security reviews
            </li>
            <li>
              Despite our efforts, no method of electronic storage is 100%
              secure. We cannot guarantee absolute security
            </li>
          </ul>
        </Section>

        <Section title="8. Data Retention">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Account data is retained for the duration of your account plus 30
              days after deletion
            </li>
            <li>
              Payment records are retained as required by applicable tax and
              financial regulations
            </li>
            <li>Usage data and analytics are retained in anonymised form</li>
            <li>
              AI interaction data is not permanently stored beyond what is needed
              for active sessions and feature functionality
            </li>
            <li>
              API keys are deleted immediately upon your request or account
              termination
            </li>
          </ul>
        </Section>

        <Section title="9. Your Rights">
          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
            9.1 All Users
          </h3>
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and associated data</li>
            <li>Export your data</li>
            <li>Remove stored API keys at any time</li>
          </ul>

          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
            9.2 EEA Users (GDPR Rights)
          </h3>
          <p>
            If you are in the European Economic Area, you additionally have the
            right to:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Object to processing based on legitimate interest</li>
            <li>Restrict processing of your data</li>
            <li>Data portability</li>
            <li>Withdraw consent at any time</li>
            <li>Lodge a complaint with a supervisory authority</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, contact us at privacy@lernf.com.
          </p>
        </Section>

        <Section title="10. Cookies and Tracking">
          <p>The Service uses cookies and similar technologies for:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Essential cookies:</strong> Required for authentication
              and session management (provided by Clerk)
            </li>
            <li>
              <strong>Analytics cookies:</strong> To understand how the Service
              is used and improve performance
            </li>
          </ul>
          <p className="mt-2">
            We do not use cookies for advertising purposes. You can control
            cookie settings through your browser preferences.
          </p>
        </Section>

        <Section title="11. International Data Transfers">
          <p>
            Your data may be processed in countries outside your country of
            residence, including New Zealand, the United States, and the European
            Union, depending on where our service providers operate. Where data
            is transferred outside the EEA, we ensure appropriate safeguards are
            in place, such as standard contractual clauses.
          </p>
        </Section>

        <Section title="12. Children's Privacy">
          <p>
            The Service is not intended for users under 18 years of age. We do
            not knowingly collect personal information from children. If we
            become aware that we have collected data from a child under 18, we
            will take steps to delete that information.
          </p>
        </Section>

        <Section title="13. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of material changes by posting the updated policy on the Service
            with a new &ldquo;Last updated&rdquo; date. Continued use of the
            Service after changes constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section title="14. Contact">
          <p>
            For privacy-related questions or to exercise your rights, contact us
            at:
          </p>
          <p className="mt-2">
            Email:{' '}
            <a
              href="mailto:privacy@lernf.com"
              className="text-blue-600 hover:underline"
            >
              privacy@lernf.com
            </a>
          </p>
          <p className="mt-2">
            For GDPR-related complaints, you also have the right to contact your
            local data protection authority.
          </p>
        </Section>
      </div>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-3">{title}</h2>
      {children}
    </section>
  )
}

export default PrivacyPolicyPage
