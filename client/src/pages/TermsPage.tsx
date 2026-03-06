export function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
        Terms of Use
      </h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: March 2026</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <Section title="1. Agreement to Terms">
          <p>
            By accessing or using Lernf (&ldquo;the Service&rdquo;), available
            at lernf.com, you agree to be bound by these Terms of Use
            (&ldquo;Terms&rdquo;). If you do not agree to these Terms, do not
            use the Service. The Service is operated by Edward Hong
            (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), based
            in New Zealand.
          </p>
        </Section>

        <Section title="2. Description of Service">
          <p>
            Lernf is an AI literacy and risk assessment platform that provides
            interactive training scenarios, AI behavioral analysis tools, and
            critical thinking assessments for individuals and teams. The Service
            may include features that interact with third-party AI providers
            using API keys supplied by you or included as part of a paid
            subscription.
          </p>
        </Section>

        <Section title="3. Eligibility">
          <p>
            You must be at least 18 years old and capable of entering into a
            binding legal agreement to use the Service.
          </p>
        </Section>

        <Section title="4. Account Registration">
          <p>
            You must create an account to access certain features of the
            Service. Account authentication is managed by Clerk, a third-party
            authentication provider. You are responsible for maintaining the
            confidentiality of your account credentials and for all activity
            that occurs under your account.
          </p>
        </Section>

        <Section title="5. Subscription Plans and Billing">
          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
            5.1 Free Tier
          </h3>
          <p>
            The free tier requires you to provide your own API keys for
            third-party AI providers. We do not charge for the free tier.
          </p>

          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
            5.2 Paid Subscriptions
          </h3>
          <p>
            Paid subscriptions are available as Individual ($20 USD/month) and
            Team ($15 USD/seat/month, minimum 5 seats) plans. Prices are subject
            to change with 30 days&apos; notice.
          </p>

          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
            5.3 Free Trial
          </h3>
          <p>
            New paid subscribers may receive a 14-day free trial with capped
            token usage. A valid payment method is required to start a trial. If
            you do not cancel before the trial ends, your payment method will be
            charged automatically.
          </p>

          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
            5.4 Billing
          </h3>
          <p>
            All payments are processed by Stripe, a third-party payment
            processor. By subscribing, you agree to Stripe&apos;s terms of
            service. Subscriptions are billed monthly in advance.
          </p>

          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
            5.5 Cancellation
          </h3>
          <p>
            You may cancel your subscription at any time through the Stripe
            billing portal accessible from your account. Cancellation takes
            effect at the end of your current billing period. No partial refunds
            are provided for unused portions of a billing period.
          </p>

          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
            5.6 Refunds
          </h3>
          <p>
            Refunds may be issued at our sole discretion on a case-by-case
            basis. To request a refund, contact us at support@lernf.com.
          </p>
        </Section>

        <Section title="6. API Keys">
          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
            6.1 Your API Keys
          </h3>
          <p>
            If you use the free tier, you are responsible for providing and
            managing your own API keys for third-party AI providers (such as
            OpenAI, Anthropic, Google, or others). You are solely responsible
            for any costs incurred through the use of your API keys.
          </p>

          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
            6.2 Storage of API Keys
          </h3>
          <p>
            API keys you provide are stored on our servers. While we implement
            reasonable security measures to protect your keys, we are not liable
            for any unauthorized access to or misuse of your API keys. You
            should monitor your API key usage through your AI provider&apos;s
            dashboard.
          </p>

          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
            6.3 Revocation
          </h3>
          <p>
            You may remove your stored API keys at any time through the Service.
            We recommend revoking and regenerating your API keys with your
            provider if you believe they have been compromised.
          </p>
        </Section>

        <Section title="7. Acceptable Use">
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Use the Service for any unlawful purpose</li>
            <li>
              Attempt to gain unauthorized access to the Service or its systems
            </li>
            <li>
              Interfere with or disrupt the Service or its infrastructure
            </li>
            <li>
              Use automated tools (bots, scrapers, etc.) to access the Service
              without our written permission
            </li>
            <li>
              Reverse engineer, decompile, or disassemble any aspect of the
              Service
            </li>
            <li>Share your account credentials with others</li>
            <li>
              Use the Service to generate harmful, abusive, or illegal content
              through AI interactions
            </li>
            <li>
              Resell or redistribute access to the Service without our written
              permission
            </li>
          </ul>
        </Section>

        <Section title="8. Intellectual Property">
          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
            8.1 Our Content
          </h3>
          <p>
            The Service, including the GRIP framework, case studies, training
            scenarios, and all related content, is owned by us and protected by
            intellectual property laws. You may not reproduce, distribute, or
            create derivative works from our content without our written
            permission.
          </p>

          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
            8.2 Your Content
          </h3>
          <p>
            You retain ownership of any content you create or input through the
            Service, including scenario responses and assessment results.
          </p>

          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
            8.3 Feedback
          </h3>
          <p>
            If you provide feedback or suggestions about the Service, you grant
            us a non-exclusive, royalty-free, perpetual license to use that
            feedback for any purpose.
          </p>
        </Section>

        <Section title="9. AI-Generated Content">
          <p>
            The Service facilitates interactions with third-party AI models. We
            do not control the output of these AI models and make no
            representations about the accuracy, reliability, or appropriateness
            of AI-generated content. You acknowledge that:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>AI outputs may contain errors, biases, or inaccuracies</li>
            <li>
              AI outputs should not be relied upon as professional, legal,
              medical, or financial advice
            </li>
            <li>
              You are responsible for evaluating and verifying any AI-generated
              content
            </li>
          </ul>
        </Section>

        <Section title="10. Team Accounts">
          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
            10.1 Team Administrator
          </h3>
          <p>
            The person who creates a team subscription is the team administrator
            and is responsible for managing team members and billing.
          </p>

          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
            10.2 Team Member Access
          </h3>
          <p>
            Team members are granted access based on the number of seats
            purchased. Each seat is for a single named individual and may not be
            shared.
          </p>
        </Section>

        <Section title="11. Privacy">
          <p>
            Your use of the Service is also governed by our{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            , which is incorporated into these Terms by reference.
          </p>
        </Section>

        <Section title="12. Disclaimer of Warranties">
          <p className="uppercase text-sm">
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; without warranties of any kind, either express or
            implied, including but not limited to warranties of merchantability,
            fitness for a particular purpose, or non-infringement. We do not
            warrant that the Service will be uninterrupted, error-free, or
            secure.
          </p>
        </Section>

        <Section title="13. Limitation of Liability">
          <p className="uppercase text-sm">
            To the maximum extent permitted by law, we shall not be liable for
            any indirect, incidental, special, consequential, or punitive
            damages, including but not limited to loss of profits, data, or
            business opportunities, arising out of or related to your use of the
            Service. Our total liability shall not exceed the amounts paid by
            you to us in the twelve (12) months preceding the claim.
          </p>
        </Section>

        <Section title="14. Indemnification">
          <p>
            You agree to indemnify and hold us harmless from any claims,
            damages, losses, or expenses (including reasonable legal fees)
            arising from your use of the Service, violation of these Terms, or
            infringement of any third-party rights.
          </p>
        </Section>

        <Section title="15. Modifications to Terms">
          <p>
            We may update these Terms from time to time. We will notify you of
            material changes by posting the updated Terms on the Service with a
            new &ldquo;Last updated&rdquo; date. Continued use of the Service
            after changes constitutes acceptance of the updated Terms.
          </p>
        </Section>

        <Section title="16. Termination">
          <p>
            We may suspend or terminate your access to the Service at any time,
            with or without cause, and with or without notice. Upon termination,
            your right to use the Service ceases immediately. Provisions that by
            their nature should survive termination (including limitations of
            liability, indemnification, and intellectual property) shall survive.
          </p>
        </Section>

        <Section title="17. Governing Law">
          <p>
            These Terms are governed by the laws of New Zealand. Any disputes
            arising from these Terms shall be resolved in the courts of New
            Zealand.
          </p>
        </Section>

        <Section title="18. Severability">
          <p>
            If any provision of these Terms is found to be unenforceable, the
            remaining provisions shall continue in full force and effect.
          </p>
        </Section>

        <Section title="19. Entire Agreement">
          <p>
            These Terms, together with the{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            , constitute the entire agreement between you and us regarding the
            Service.
          </p>
        </Section>

        <Section title="20. Contact">
          <p>
            For questions about these Terms, contact us at support@lernf.com.
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

export default TermsPage
