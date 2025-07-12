import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import useContent from '../../lib/useContent';

const ContactSection = ({ content }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const getContent = (key, defaultValue = '') => {
    return content?.[key] || defaultValue;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSubmitted(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', message: '' }); // Clear form on success
        
        // Reset 'Submitted' state after a delay
        setTimeout(() => {
          setIsSubmitted(false);
        }, 3000);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white text-text-primary py-16 md:py-20 text-center">
      <div className="max-w-xl mx-auto px-6 md:px-8">
        <h2 className="contact h2 font-montserrat text-3xl md:text-4xl font-bold mb-4 text-primary relative inline-block">
{getContent('contact.title', 'Get In Touch')}
          <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-accent1 rounded-full"></span>
        </h2>
        <p className="font-source-serif text-base text-text-secondary mb-8">
{getContent('contact.subtitle', 'Have questions or want to learn more about our volunteer opportunities? Send us a message and we\'ll get back to you soon.')}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto text-left bg-surface p-6 rounded-lg shadow-md border border-border">
          <Input
            type="text"
            name="name"
            placeholder={getContent('contact.name.placeholder', 'Your Name')}
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting || isSubmitted}
            className="flex-grow border-none text-sm"
          />
          <Input
            type="email"
            name="email"
            placeholder={getContent('contact.email.placeholder', 'Your Email')}
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isSubmitting || isSubmitted}
            className="flex-grow border-none text-sm"
          />
          <Textarea
            name="message"
            placeholder={getContent('contact.message.placeholder', 'Your Message')}
            value={formData.message}
            onChange={handleChange}
            required
            disabled={isSubmitting || isSubmitted}
            className="flex-grow border-none text-sm"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || isSubmitted}
            className={`
              ${isSubmitted ? 'bg-green-500 hover:bg-green-600' : ''}
              ${isSubmitting ? 'cursor-not-allowed opacity-70' : ''}
              w-full mt-2
            `}
          >
{isSubmitting ? getContent('contact.sending', 'Sending...') : (isSubmitted ? getContent('contact.sent', '✓ Message Sent!') : getContent('contact.submit', 'Send Message'))}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
