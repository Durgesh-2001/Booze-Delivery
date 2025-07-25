import React from 'react'
import './Legal.css'

const Legal = () => {
  return (
    <div className="legal-container">
      <div className="legal-content">
        <div className="terms-conditions">
          <h1>Terms and Conditions</h1>
          <p className="last-updated">Effective Date: Friday, 21 March 2025</p>
          <p className="location">Location: Bengaluru, Karnataka, India</p>

          <div className="intro">
            <p>
              Welcome to Booze Delivery! By accessing or using our alcohol delivery services, 
              you agree to be bound by these Terms and Conditions ("Terms"). Please read them carefully before using the Booze Delivery platform.
            </p>
          </div>

          <div className="terms-sections">
            {termsData.map((term, index) => (
              <section key={index} className="term-section">
                <h2>{term.title}</h2>
                {Array.isArray(term.content) ? (
                  <ul>
                    {term.content.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{term.content}</p>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const termsData = [
  {
    title: "1. Acceptance of Terms",
    content: "By accessing Booze Delivery's website or services, you confirm your acceptance of these Terms. If you do not agree, you may not use our services."
  },
  {
    title: "2. Legal Drinking Age",
    content: [
      "You must be of legal drinking age (18 or 21 depending on local laws) to access or make purchases on Booze Delivery.",
      "We reserve the right to verify age via ID or digital methods at the time of delivery."
    ]
  },
  {
    title: "3. Product Availability",
    content: [
      "Product availability is subject to location and applicable state regulations.",
      "Booze Delivery reserves the right to limit quantities and reject orders due to legal restrictions."
    ]
  },
  {
    title: "4. Order Processing & Delivery",
    content: [
      "Orders are processed during legal alcohol sale hours only.",
      "Delivery times may vary due to state-specific rules or operational limitations.",
      "You or an authorized adult must be available to receive the order and provide age verification upon delivery."
    ]
  },
  {
    title: "5. Returns and Refunds",
    content: [
      "Due to alcohol regulations, returns are only accepted in case of damaged or incorrect items.",
      "Refund requests must be made within 24 hours of delivery with photographic evidence."
    ]
  },
  {
    title: "6. User Accounts",
    content: [
      "Users must provide accurate and up-to-date personal and delivery information.",
      "You are responsible for keeping your account credentials secure.",
      "Multiple failed delivery attempts may result in suspension or account termination."
    ]
  },
  {
    title: "7. Health Disclaimer",
    content: "Drink responsibly. Excessive alcohol consumption is harmful to health. Seek help if you're struggling with alcohol dependency."
  },
  {
    title: "8. Payment & Billing",
    content: [
      "All payments must be made through supported online payment gateways.",
      "Prices may include applicable state taxes, service fees, or delivery charges."
    ]
  },
  {
    title: "9. Privacy",
    content: "Our Privacy Policy explains how we handle your personal data. By using Booze Delivery, you agree to our data practices."
  },
  {
    title: "10. Limitation of Liability",
    content: "Booze Delivery is not responsible for delays, non-delivery, or service interruptions due to government restrictions, weather, or unforeseen events."
  },
  {
    title: "11. Governing Law",
    content: "These Terms will be governed by and construed in accordance with the laws of India and relevant state jurisdictions."
  },
  {
    title: "12. Contact Us",
    content: "For questions regarding these Terms, contact us at support@boozedel.in"
  }
]

export default Legal
