import LegalPage, {Mail, PAYMENT_METHODS} from "@/components/custom/legal-page"
import {formatIdr, usdToIdrRate} from "@/utils/helpers/format-usd"
import {connection} from "next/server"

export const metadata = {title: "Terms of Service", description: "Terms for using seevee", alternates: {canonical: "/terms"}}

export default async function TermsPage() {
    // Render per request so the rate below is the one checkout uses now, not the one at build time.
    await connection()
    const rate = usdToIdrRate()
    return (
        <LegalPage title="Terms of Service" updated="11 November 2026">
            <section>
                <h2>1. Acceptance</h2>
                <p>By creating an account or using seevee, you agree to these terms. If you do not agree, do not use the service.</p>
            </section>
            <section>
                <h2>2. The service</h2>
                <p>
                    seevee is an online resume builder. You can write, edit, print and share resumes for free, up to 50 resumes per account. AI rewrites (tailoring to a job
                    description, translating, or following your own instruction) are paid with credits.
                </p>
            </section>
            <section>
                <h2>3. Your account</h2>
                <ul>
                    <li>You sign in with your Google account and are responsible for activity on it.</li>
                    <li>You must give accurate information and must not use the service for anything illegal.</li>
                    <li>We may suspend accounts that break these terms.</li>
                </ul>
            </section>
            <section id="payment" className="scroll-mt-6">
                <h2>4. Credits and payment</h2>
                <ul>
                    <li>Credits are sold in packs. Prices are shown in US Dollars (USD) on the pricing section and may change at any time.</li>
                    <li>
                        Payments are charged in Indonesian Rupiah (IDR), converted from the USD price at our own fixed exchange rate
                        {rate ? <> (currently 1 USD = {formatIdr(rate)})</> : null}. We may update this rate at any time. The exact IDR amount is shown on the pricing
                        section and at checkout before you pay.
                    </li>
                    <li>
                        If your card or account is not in IDR, your bank converts the charge to your currency, so the final amount on your statement may differ slightly and
                        may include foreign transaction fees set by your bank.
                    </li>
                    <li>One AI rewrite uses one credit.</li>
                    <li>
                        Payments are processed by Midtrans (PT Midtrans), an Indonesian payment gateway. We never see or store your card number, CVV or PIN. Accepted
                        methods: {PAYMENT_METHODS.join(", ")}. Availability can depend on Midtrans and your bank.
                    </li>
                    <li>Credits are added to your account once Midtrans confirms the payment.</li>
                    <li>All purchases are final. Credits are non-refundable and cannot be exchanged for cash.</li>
                </ul>
            </section>
            <section>
                <h2>5. Your content</h2>
                <p>
                    You own the resumes you write. You let us store and process them only to run the service, including sending them to our AI provider
                    when you request a rewrite. You are responsible for checking that AI-rewritten content is accurate before you use it.
                </p>
            </section>
            <section>
                <h2>6. Prohibited use</h2>
                <ul>
                    <li>Using bots or scrapers, or trying to break, overload or bypass the security of the service.</li>
                    <li>Publishing content that is illegal, misleading, or infringes the rights of others.</li>
                </ul>
            </section>
            <section>
                <h2>7. Liability</h2>
                <p>
                    seevee is provided as is. We do not guarantee uninterrupted access or any job outcome, and we are not liable for indirect losses
                    from using the service.
                </p>
            </section>
            <section>
                <h2>8. Changes</h2>
                <p>We may update the service or these terms. Continuing to use seevee after a change means you accept the updated terms.</p>
            </section>
            <section>
                <h2>9. Governing law</h2>
                <p>These terms are governed by the laws of the Republic of Indonesia.</p>
            </section>
            <section>
                <h2>10. Contact</h2>
                <p>
                    Questions about these terms: <Mail />
                </p>
            </section>
        </LegalPage>
    )
}
