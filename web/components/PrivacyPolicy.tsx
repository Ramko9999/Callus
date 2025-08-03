export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="animate-fade-in">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
              Privacy Policy
            </h1>
            <p className="text-text-secondary text-lg">
              Last updated: June 1, 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-text-primary mb-4 border-b border-gray-700 pb-2">
                  1. Introduction
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  Callus ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how your information is handled within the Callus mobile application ("the app").
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-text-primary mb-4 border-b border-gray-700 pb-2">
                  2. Data Collection
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  Callus does not collect, store, or transmit any personal information to external servers. All data you input and generate within the app—including workout logs, exercise history, and personal metrics—are stored locally on your device and remain under your control.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-text-primary mb-4 border-b border-gray-700 pb-2">
                  3. Data Usage
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  All workout data is stored on your device and is only used to provide app functionality, such as tracking your progress and visualizing your workouts. We do not share or sell your data to any third parties.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-text-primary mb-4 border-b border-gray-700 pb-2">
                  4. Offline Functionality
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  The app is designed to function offline. No internet connection is required to access your data or use any features within the app.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-text-primary mb-4 border-b border-gray-700 pb-2">
                  5. Security
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  We take the security of your data seriously. Since your data is stored locally on your device, it is protected by your device's operating system security features. We recommend keeping your device secure with a passcode or biometric lock.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-text-primary mb-4 border-b border-gray-700 pb-2">
                  6. Third-Party Services
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  Callus does not integrate with any external services that would require sharing your data.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-text-primary mb-4 border-b border-gray-700 pb-2">
                  7. Changes to This Policy
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-text-primary mb-4 border-b border-gray-700 pb-2">
                  8. Contact Us
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  If you have any questions or concerns about this Privacy Policy, please contact:
                </p>
                <div className="mt-4 p-6 bg-secondary rounded-lg border border-gray-700">
                  <p className="text-text-primary font-semibold">Ramki Pitchala</p>
                  <p className="text-text-secondary">
                    Email: <a href="mailto:ramapitchala@gmail.com" className="text-primary hover:text-cta-hover">ramapitchala@gmail.com</a>
                  </p>
                </div>
              </section>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-16 text-center">
            <a 
              href="/" 
              className="inline-flex items-center text-primary hover:text-cta-hover transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 