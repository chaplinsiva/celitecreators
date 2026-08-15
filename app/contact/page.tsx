import type { Metadata } from 'next';
import ContactContent from './ContactContent';

export const metadata: Metadata = {
  title: "Contact Us | Celite Market",
  description: "Get in touch with the Celite Market support team. We're here to assist creators and buyers.",
};

export default function ContactPage() {
  return <ContactContent />;
}
