import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebaseErrors';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Send,
  HelpCircle,
} from 'lucide-react';
import { FAQS } from '../data/mockData';
import { PageView } from '../types';

interface StaticPageProps {
  page: 'about' | 'contact' | 'faq' | 'shipping' | 'returns' | 'privacy' | 'terms';
  setCurrentPage?: (page: PageView) => void;
}

export const StaticPages: React.FC<StaticPageProps> = ({ page, setCurrentPage }) => {
  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('Order & Sizing Help');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<string>('Orders & Payments-0');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const inquiryId = `inq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    try {
      await setDoc(doc(db, 'inquiries', inquiryId), {
        id: inquiryId,
        inquiryId,
        name: contactName,
        customerName: contactName,
        email: contactEmail,
        subject: contactSubject,
        type: contactSubject,
        message: contactMessage,
        status: 'New',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `inquiries/${inquiryId}`);
    }
    setContactSubmitted(true);
  };

  /* ---------------- ABOUT US ---------------- */
  if (page === 'about') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F]">
            Our Modest Heritage
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#0F1E36]">
            About Mumtahina’s Closet Inc
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Founded with a singular commitment: empowering modest individuals across the United States to express their dignity, poise, and faith without compromising on contemporary tailoring or luxurious fabric.
          </p>
        </div>

        {/* Editorial Brand Image */}
        <div className="rounded-3xl overflow-hidden shadow-sm aspect-[16/8] bg-[#FAF7F6]">
          <img
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=85"
            alt="Mumtahina's Closet Atelier"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6">
          <div className="p-6 bg-white rounded-2xl border border-[#F0E4E6] shadow-2xs space-y-2">
            <h3 className="font-serif text-base font-bold text-[#0F1E36]">Pure Opacity</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every garment undergoes rigorous backlight testing to ensure zero transparency, eliminating the need for uncomfortable extra layers in warm seasons.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#F0E4E6] shadow-2xs space-y-2">
            <h3 className="font-serif text-base font-bold text-[#0F1E36]">USA Tailoring Standards</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Headquartered in Dallas, Texas, our team personally measures, steams, and hand-inspects every abaya, dress, and hijab before dispatch.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#F0E4E6] shadow-2xs space-y-2">
            <h3 className="font-serif text-base font-bold text-[#0F1E36]">Inclusive Fit Hierarchy</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              From petite lengths (size 52) to statuesque cuts (size 60), our sizing accommodates diverse body silhouettes with graceful, non-clingy lines.
            </p>
          </div>
        </div>

        <div className="bg-[#FAF0F2] p-8 sm:p-10 rounded-3xl border border-[#F4D3D7] space-y-4 text-center">
          <h2 className="font-serif text-2xl font-bold text-[#0F1E36]">
            “Modesty is not about hiding; it is about revealing your inner grace with dignity.”
          </h2>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2D6A4F]">
            — Mumtahina, Founder & Creative Director
          </p>
        </div>
      </div>
    );
  }

  /* ---------------- CONTACT US ---------------- */
  if (page === 'contact') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F]">
            We Are Here To Assist
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F1E36]">
            Contact Our USA Concierge
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Have questions about abaya lengths, fabric feel, or custom bridal orders? Our Dallas styling team is at your service.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#F0E4E6] shadow-2xs space-y-6">
            <h3 className="font-serif text-lg font-bold text-[#0F1E36]">
              Store Headquarters & Showroom
            </h3>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#2D6A4F] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0F1E36] block">Studio & Headquarters:</strong>
                  <span>Mumtahina’s Closet Inc<br />1400 Preston Rd, Suite 400<br />Dallas, TX 75093, United States</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#2D6A4F] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0F1E36] block">Toll-Free Phone:</strong>
                  <span>+1 (800) 555-6868</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#2D6A4F] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0F1E36] block">Direct Email:</strong>
                  <span>care@mumtahinascloset.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#2D6A4F] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0F1E36] block">Concierge Hours:</strong>
                  <span>Monday – Friday: 9:00 AM – 6:00 PM CST<br />Saturday: 10:00 AM – 4:00 PM CST</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#FAF7F6] rounded-2xl border border-[#F0E4E6] text-xs">
              <p className="font-semibold text-[#0F1E36]">Need quick help with sizing?</p>
              <p className="text-slate-500 mt-0.5">
                Check our interactive sizing tables on any product page or visit our FAQ section.
              </p>
            </div>
          </div>

          {/* Interactive Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#F0E4E6] shadow-2xs">
            {contactSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#EBF5F0] text-[#2D6A4F] flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1E36]">Message Received!</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Thank you, {contactName}. A modest styling concierge will reply to <strong>{contactEmail}</strong> within 1 business day.
                </p>
                <button
                  onClick={() => setContactSubmitted(false)}
                  className="px-6 py-2.5 bg-[#2D6A4F] text-white text-xs font-semibold rounded-xl"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#0F1E36]">Send Us an Inquiry</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Fatima Khan"
                      className="w-full p-2.5 text-xs border border-[#E2D2D5] rounded-xl focus:outline-hidden focus:border-[#2D6A4F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Email</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full p-2.5 text-xs border border-[#E2D2D5] rounded-xl focus:outline-hidden focus:border-[#2D6A4F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    className="w-full p-2.5 text-xs border border-[#E2D2D5] rounded-xl focus:outline-hidden focus:border-[#2D6A4F] bg-white"
                  >
                    <option value="Order & Sizing Help">Order & Sizing Consultation</option>
                    <option value="Shipping & Delivery">Shipping & Tracking Status</option>
                    <option value="Returns & Exchanges">30-Day Return / Exchange</option>
                    <option value="Custom / Bridal Modest Order">Bridal or Custom Order Request</option>
                    <option value="General Question">General Feedback or Inquiries</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="How may our modest styling team help you today? Include order numbers if applicable..."
                    className="w-full p-2.5 text-xs border border-[#E2D2D5] rounded-xl focus:outline-hidden focus:border-[#2D6A4F]"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Inquiry to Concierge</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- FAQ ---------------- */
  if (page === 'faq') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F]">
            Help & Guidance
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F1E36]">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Find immediate answers regarding modest sizing, orders, USA delivery timelines, and fabric care.
          </p>
        </div>

        <div className="space-y-8">
          {FAQS.map((category) => (
            <div key={category.category} className="space-y-3">
              <h3 className="font-serif text-base font-bold text-[#0F1E36] border-b border-[#F0E4E6] pb-2">
                {category.category}
              </h3>
              <div className="space-y-2.5">
                {category.questions.map((item, idx) => {
                  const key = `${category.category}-${idx}`;
                  const isOpen = openFaqIndex === key;

                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-xl border border-[#F0E4E6] overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? '' : key)}
                        className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-[#0F1E36] hover:text-[#2D6A4F]"
                      >
                        <span>{item.q}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-[#FAF0F2] pt-3">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---------------- SHIPPING & DELIVERY ---------------- */
  if (page === 'shipping') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
        <div className="border-b border-[#F0E4E6] pb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F]">
            USA Logistics
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#0F1E36]">
            Shipping & Delivery Policy
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Last updated: September 2026 • Dispatched from Dallas, Texas, USA
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-[#F0E4E6] shadow-2xs">
            <Truck className="w-6 h-6 text-[#2D6A4F] mb-2" />
            <h4 className="font-bold text-sm text-[#0F1E36]">Standard USA Ground</h4>
            <p className="text-xs text-slate-600 mt-1">3–5 Business Days</p>
            <p className="text-xs font-bold text-[#2D6A4F] mt-2">FREE on orders $75+ ($5.99 under $75)</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#F0E4E6] shadow-2xs">
            <Clock className="w-6 h-6 text-[#2D6A4F] mb-2" />
            <h4 className="font-bold text-sm text-[#0F1E36]">FedEx 2-Day Air</h4>
            <p className="text-xs text-slate-600 mt-1">2 Business Days Guaranteed</p>
            <p className="text-xs font-bold text-[#0F1E36] mt-2">$14.99 Flat Rate</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#F0E4E6] shadow-2xs">
            <ShieldCheck className="w-6 h-6 text-[#2D6A4F] mb-2" />
            <h4 className="font-bold text-sm text-[#0F1E36]">Overnight Express</h4>
            <p className="text-xs text-slate-600 mt-1">Next Business Day Delivery</p>
            <p className="text-xs font-bold text-[#0F1E36] mt-2">$24.99 Flat Rate</p>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#F0E4E6] text-xs text-slate-700 space-y-4 leading-relaxed">
          <h3 className="font-serif text-base font-bold text-[#0F1E36]">Fulfillment & Processing Timelines</h3>
          <p>
            All in-stock garments are carefully steamed, inspected for stitching integrity, and packaged in protective garment bags at our domestic atelier in Dallas, Texas. Orders submitted before 2:00 PM CST Monday through Friday begin dispatch that same day.
          </p>

          <h3 className="font-serif text-base font-bold text-[#0F1E36] pt-2">Tracking Your Shipment</h3>
          <p>
            Once your order has been packaged and scanned by USPS or FedEx, you will receive an automatic dispatch notification containing your direct tracking link. You can also view live delivery milestones directly in our Customer Order Portal at any time.
          </p>

          <h3 className="font-serif text-base font-bold text-[#0F1E36] pt-2">Signature on Delivery</h3>
          <p>
            To prevent porch theft on high-value couture orders over $300, signature upon delivery may be required.
          </p>
        </div>
      </div>
    );
  }

  /* ---------------- RETURN & REFUND POLICY ---------------- */
  if (page === 'returns') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
        <div className="border-b border-[#F0E4E6] pb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F]">
            Worry-Free Shopping
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#0F1E36]">
            30-Day Hassle-Free Returns
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Easy return label generation for all continental USA customers
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#F0E4E6] text-xs text-slate-700 space-y-4 leading-relaxed">
          <h3 className="font-serif text-base font-bold text-[#0F1E36]">Our 30-Day Guarantee</h3>
          <p>
            At Mumtahina’s Closet Inc, your satisfaction and comfort in your modest wardrobe are paramount. If an abaya length is not ideal or a silhouette doesn’t suit your preference, you may return any unworn, unwashed item within 30 days of the delivery date for a full refund or exchange.
          </p>

          <h3 className="font-serif text-base font-bold text-[#0F1E36] pt-2">Return Conditions</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Garments must remain unworn, unperfumed, unwashed, and with all original brand tags attached.</li>
            <li>Abaya belt sashes and matching slip dresses must be returned together as a complete set.</li>
            <li>For hygiene considerations, open undercaps and magnetic pin sets cannot be returned unless manufacturer defective.</li>
          </ul>

          <h3 className="font-serif text-base font-bold text-[#0F1E36] pt-2">How to Initiate a Return</h3>
          <p>
            Visit your Account Order History, click "Request Return", and generate your prepaid USPS return label immediately. Drop the package off at any post office or schedule a free USPS postal pickup from your home.
          </p>
        </div>
      </div>
    );
  }

  /* ---------------- PRIVACY POLICY ---------------- */
  if (page === 'privacy') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-6">
        <div className="border-b border-[#F0E4E6] pb-4">
          <h1 className="font-serif text-3xl font-bold text-[#0F1E36]">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Mumtahina’s Closet Inc • Compliance with USA & State Privacy Regulations
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#F0E4E6] text-xs text-slate-700 space-y-4 leading-relaxed">
          <p>
            Mumtahina’s Closet Inc (“we,” “our,” or “us”) respects your privacy and is committed to safeguarding your personal data. This policy describes how we collect, utilize, and protect your information when you browse our boutique website or purchase modest apparel.
          </p>
          <h4 className="font-bold text-[#0F1E36]">1. Data Collection</h4>
          <p>
            We collect contact and delivery information (name, address, telephone, email) exclusively to fulfill your clothing orders, compute correct state taxes, and provide delivery notifications.
          </p>
          <h4 className="font-bold text-[#0F1E36]">2. Payment Security</h4>
          <p>
            We process transactions exclusively via verified Zelle direct bank transfers. We never request or store sensitive banking credentials or credit card numbers on our servers.
          </p>
          <h4 className="font-bold text-[#0F1E36]">3. Zero Data Sale</h4>
          <p>
            We do not sell, lease, or monetize customer information to third-party marketing brokers.
          </p>
        </div>
      </div>
    );
  }

  /* ---------------- TERMS & CONDITIONS ---------------- */
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-6">
      <div className="border-b border-[#F0E4E6] pb-4">
        <h1 className="font-serif text-3xl font-bold text-[#0F1E36]">
          Terms & Conditions of Service
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Effective September 2026 • Mumtahina’s Closet Inc (USA)
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#F0E4E6] text-xs text-slate-700 space-y-4 leading-relaxed">
        <p>
          By accessing or placing an order through the Mumtahina’s Closet Inc website, you agree to adhere to these terms and conditions.
        </p>
        <h4 className="font-bold text-[#0F1E36]">1. Product Specifications & Photography</h4>
        <p>
          We strive to accurately represent the draping, texture, and colors of our modest wear. Slight variations may occur depending on your monitor calibration and screen brightness.
        </p>
        <h4 className="font-bold text-[#0F1E36]">2. Intellectual Property</h4>
        <p>
          All trademarks, designs, logos, and styling copy are the proprietary intellectual property of Mumtahina’s Closet Inc, registered in the United States.
        </p>
        <h4 className="font-bold text-[#0F1E36]">3. Governing Law</h4>
        <p>
          These terms are governed by and construed in accordance with the laws of the State of Texas and the United States of America.
        </p>
      </div>
    </div>
  );
};
