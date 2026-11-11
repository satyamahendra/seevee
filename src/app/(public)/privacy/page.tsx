import LegalPage, {Mail} from "@/components/custom/legal-page"

export const metadata = {title: "Privacy Policy", description: "How seevee collects and uses your data", alternates: {canonical: "/privacy"}}

export default function PrivacyPage() {
    return (
        <LegalPage title="Privacy Policy" updated="8 November 2026">
            <section>
                <h2>1. What we collect</h2>
                <ul>
                    <li>Account data from Google sign-in: your name, email address and profile picture.</li>
                    <li>The resume content you write in seevee.</li>
                    <li>Order records: the pack you bought, the amount, and the payment status from Midtrans.</li>
                    <li>Basic technical data needed to keep you signed in, such as session cookies.</li>
                </ul>
            </section>
            <section>
                <h2>2. How we use it</h2>
                <ul>
                    <li>To run your account and save your resumes.</li>
                    <li>To process payments and add credits to your account.</li>
                    <li>To publish a resume at its share link, only when you turn sharing on.</li>
                    <li>To answer your support requests.</li>
                </ul>
            </section>
            <section>
                <h2>3. Who we share it with</h2>
                <p>We do not sell your data. We only share what each provider needs:</p>
                <ul>
                    <li>Midtrans, to process your payment.</li>
                    <li>Google, for sign-in, and Google Gemini, which receives the resume content you ask the AI to rewrite.</li>
                    <li>Our hosting and database providers, which store the data for us.</li>
                    <li>Authorities, when the law requires it.</li>
                </ul>
            </section>
            <section>
                <h2>4. Public resumes</h2>
                <p>Resumes are private by default. When you make one public, anyone with its link can view it. You can turn this off at any time.</p>
            </section>
            <section>
                <h2>5. Keeping and deleting data</h2>
                <p>
                    We keep your data while your account is active. You can delete any resume yourself. To delete your account and its data, email <Mail />.
                    Order records may be kept longer where the law requires it.
                </p>
            </section>
            <section>
                <h2>6. Security</h2>
                <p>Traffic is encrypted over HTTPS and payment details are handled entirely by Midtrans. No system is perfectly secure, but we work to protect your data.</p>
            </section>
            <section>
                <h2>7. Your rights</h2>
                <p>
                    You can ask to access, correct or delete your personal data, in line with Indonesia&apos;s Personal Data Protection Law (UU PDP). Email <Mail />.
                </p>
            </section>
            <section>
                <h2>8. Changes</h2>
                <p>We may update this policy. The date at the top shows the latest version.</p>
            </section>
        </LegalPage>
    )
}
