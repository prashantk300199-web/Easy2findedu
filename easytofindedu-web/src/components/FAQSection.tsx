import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQ {
  _id?: string;
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
  title?: string;
}

export function FAQSection({ faqs, title = 'Frequently Asked Questions' }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-3xl text-night-800">{title}</h2>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <motion.div
            key={faq._id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-cream-300 bg-white overflow-hidden"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-cream-50 transition-colors"
            >
              <span className="font-medium text-night-800 pr-4">{faq.question}</span>
              <span
                className={`text-2xl text-gold-600 transition-transform shrink-0 ${
                  openIndex === index ? 'rotate-45' : ''
                }`}
              >
                +
              </span>
            </button>

            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-ink-600 border-t border-cream-200 pt-4">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Default FAQs for hostels
export const DEFAULT_HOSTEL_FAQS: FAQ[] = [
  {
    question: 'Why should I choose this hostel?',
    answer: 'This hostel offers verified facilities, experienced management, prime location near educational institutions, comprehensive security measures, and quality amenities. Our verified listings ensure transparency, and you can check real student reviews and ratings to make an informed decision.'
  },
  {
    question: 'What documents are required for hostel admission?',
    answer: 'Typically, you need a government-issued ID proof (Aadhar/PAN), college/institution ID card, passport-size photographs, and parent/guardian contact details. Some hostels may require additional documents like a character certificate.'
  },
  {
    question: 'Are meals included in the hostel fees?',
    answer: 'Meal inclusion varies by hostel. Some provide full-board (breakfast, lunch, dinner), while others offer only selected meals or no meals at all. Check the hostel details for specific food arrangements.'
  },
  {
    question: 'What are the hostel timings and curfew rules?',
    answer: 'Most hostels have specific entry/exit timings, usually with a night curfew around 10-11 PM. Rules may vary between boys and girls hostels. Some hostels offer 24/7 access for working professionals.'
  },
  {
    question: 'Is WiFi available in the hostel?',
    answer: 'Most modern hostels provide WiFi connectivity. Check the amenities section to confirm availability and any additional charges that may apply.'
  },
  {
    question: 'What is the security deposit and is it refundable?',
    answer: 'Security deposits vary by hostel, typically ranging from one to three months rent. The deposit is generally refundable at the time of checkout, subject to no damages to hostel property.'
  },
  {
    question: 'Can parents visit the hostel?',
    answer: 'Yes, most hostels allow parent visits during specified hours. Some hostels have guest rooms or visiting areas. It\'s best to inform the hostel management in advance.'
  },
  {
    question: 'What happens if I want to leave the hostel mid-year?',
    answer: 'Notice periods vary by hostel, typically 1-2 months. Some hostels may forfeit the security deposit for early termination. Check the hostel\'s specific terms and conditions.'
  },
  {
    question: 'Are laundry facilities available?',
    answer: 'Many hostels provide laundry services, either in-house or through third-party vendors. Some may have self-service washing machines. Check the amenities section for details.'
  }
];
