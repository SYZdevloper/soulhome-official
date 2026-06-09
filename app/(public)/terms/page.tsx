import { DecorativeArch } from "@/components/decorative-arch"

export default function TermsPage() {
  return (
    <main className="min-h-screen pt-32 pb-24 bg-background selection:bg-primary/20">
      <div className="mx-auto max-w-4xl px-6 sm:px-8">
        {/* Decorative Arch Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] -z-10 pointer-events-none opacity-10">
          <DecorativeArch className="w-full h-full text-primary" />
        </div>

        <header className="mb-16 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-4 uppercase text-primary">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground italic">
            Please read these terms carefully before engaging with our services.
          </p>
        </header>

        <div className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-headings:text-primary prose-p:text-muted-foreground leading-relaxed max-w-none">
          {/* 1:1 LIVE SESSIONS */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-8 border-b border-primary/20 pb-4">TERMS & CONDITIONS – 1:1 LIVE SESSIONS</h2>
            
            <div className="space-y-10">
              <div>
                <h3 className="text-xl font-semibold mb-3">1. Nature of Service</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>1.1 Krisha provides spiritual guidance and energy-based healing services. She is not a medical professional, psychologist, legal advisor, or financial advisor.</p>
                  <p>1.2 Sessions are intended for self-development, awareness, and energetic support. They do not constitute diagnosis, treatment, or professional advice of any kind.</p>
                  <p>1.3 No part of the session is intended to predict the future or guarantee specific outcomes.</p>
                  <p>1.4 By engaging in this service, you acknowledge:</p>
                  <p className="italic font-medium text-foreground bg-primary/5 p-4 rounded-xl border border-primary/10">
                    &ldquo;This is a self-development and spiritual education service. Results vary based on individual engagement.&rdquo;
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">2. Healing Process</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>2.1 You acknowledge that inner work and energetic processes may trigger emotional, psychological, or lifestyle changes.</p>
                  <p>2.2 You accept full responsibility for how you process, integrate, and act upon the session.</p>
                  <p>2.3 Krisha does not guarantee emotional, physical, relational, or financial outcomes.</p>
                  <p>2.4 If you are pregnant, trying to conceive, or under medical or psychological care, you agree to inform Krisha in advance and seek appropriate professional advice where necessary.</p>
                  <p>2.5 Krisha is not responsible for any health-related or psychological outcomes arising before, during, or after the session.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">3. Client Responsibility</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>3.1 You confirm that you are voluntarily choosing to participate.</p>
                  <p>3.2 You are solely responsible for your decisions, actions, and interpretations following the session.</p>
                  <p>3.3 You agree not to rely on the session as a substitute for professional advice or intervention.</p>
                  <p>3.4 Clients under 18 must have parental consent and supervision.</p>
                  <p>3.5 You are responsible for attending on time, ensuring a stable internet connection, and being in a private, distraction-free environment.</p>
                  <p>3.6 Failure to meet these conditions does not qualify for rescheduling or refund.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">4. Consent & Energetic Work</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>4.1 All sessions are conducted with your informed consent.</p>
                  <p>4.2 You understand that intuitive or energetic access is not guaranteed and may be limited.</p>
                  <p>4.3 If a session cannot proceed due to energetic misalignment, resistance, or inability to access guidance, the session will still be considered delivered and is non-refundable.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">5. Payments, Refunds & Rescheduling</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>5.1 Full payment is required in advance to confirm your booking.</p>
                  <p>5.2 All payments are final and non-refundable, including cancellations, missed sessions, or change of mind.</p>
                  <p>5.3 A session is considered a no-show if you are more than 10 minutes late. No-shows are non-refundable and non-reschedulable.</p>
                  <p>5.4 Rescheduling requests must be submitted via email, are not guaranteed within 48 hours of the session, and are approved at Krisha&apos;s discretion.</p>
                  <p>5.5 Krisha reserves the right to cancel or discontinue a session due to illness, emergency, or misalignment. In such cases, a refund or reschedule will be offered at her discretion.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">6. Ethical Boundaries</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>6.1 No harmful, manipulative, or unethical practices will be engaged with.</p>
                  <p>6.2 No predictive or fortune-telling requests will be answered.</p>
                  <p>6.3 Any abusive, inappropriate, or disrespectful behaviour will result in immediate termination of the session without refund.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">7. Confidentiality</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>7.1 All personal information and session content are treated as confidential.</p>
                  <p>7.2 Confidentiality may be broken only where required by law.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">8. Intellectual Property</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>8.1 All session content, teachings, and materials shared are the intellectual property of Krisha.</p>
                  <p>8.2 You may not record, reproduce, distribute, or share any part of the session without explicit written permission.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">9. Limitation of Liability</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>9.1 To the fullest extent permitted by law, Krisha shall not be held liable for any decisions, actions, or outcomes resulting from the session; emotional, psychological, financial, or physical effects; or indirect or consequential loss.</p>
                  <p>9.2 By booking, you agree that you are fully responsible for your life, choices, and integration.</p>
                </div>
              </div>
            </div>
          </section>

          {/* KUNDALINI SCHOOL */}
          <section>
            <h2 className="text-3xl font-bold mb-8 border-b border-primary/20 pb-4">TERMS & CONDITIONS – KUNDALINI SCHOOL</h2>
            
            <div className="space-y-10">
              <div>
                <h3 className="text-xl font-semibold mb-3">1. Nature of Service</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>1.1 Kundalini School is a digital self-development and spiritual education platform.</p>
                  <p>1.2 It does not provide medical, psychological, legal, or financial advice.</p>
                  <p>1.3 By joining, you acknowledge:</p>
                  <p className="italic font-medium text-foreground bg-primary/5 p-4 rounded-xl border border-primary/10">
                    &ldquo;This is a self-development and spiritual education platform. Results vary based on individual engagement.&rdquo;
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">2. Membership & Payment</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>2.1 This is a recurring monthly subscription.</p>
                  <p>2.2 Payments are automatically charged on your billing cycle.</p>
                  <p>2.3 You are responsible for ensuring your payment details are accurate and up to date.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">3. Subscription & Cancellation</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>3.1 Membership continues until cancelled.</p>
                  <p>3.2 Cancellation requires at least one full billing cycle notice.</p>
                  <p>3.3 You will retain access until the end of your paid period.</p>
                  <p>3.4 No partial refunds are provided for unused time.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">4. No Refund Policy</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>4.1 All payments are non-refundable once processed.</p>
                  <p>4.2 This includes lack of use, partial participation, or change of mind.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">5. Access & Use</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>5.1 Your membership grants you a limited, non-transferable, personal licence to access content.</p>
                  <p>5.2 Access may be revoked at any time if terms are violated.</p>
                  <p>5.3 Content availability may change or evolve without notice.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">6. Intellectual Property</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>6.1 All materials (videos, PDFs, audio, teachings) are owned by Krisha.</p>
                  <p>6.2 You may not share login details, distribute or resell content, or copy or reproduce materials.</p>
                  <p>6.3 Violation may result in immediate termination without refund and potential legal action.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">7. Community Conduct</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>7.1 You agree to maintain respectful and confidential participation in any group space.</p>
                  <p>7.2 Harmful, abusive, or inappropriate behaviour will result in removal without refund.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">8. Personal Responsibility</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>8.1 You are responsible for your own engagement, interpretation, and integration.</p>
                  <p>8.2 No outcomes are promised or guaranteed.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">9. Limitation of Liability</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>9.1 Kundalini School is provided &ldquo;as is&rdquo; without warranties of any kind.</p>
                  <p>9.2 Krisha is not liable for personal outcomes, misuse or misinterpretation of content, or technical interruptions.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">10. General Legal Protection</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>10.1 These terms are governed by the laws of the United Kingdom.</p>
                  <p>10.2 By using this website or services, you agree to these terms in full.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
