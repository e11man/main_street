import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSubmitted(false);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' }); // Clear form on success

      // Reset 'Submitted' state after a delay
      setTimeout(() => {
        setIsSubmitted(false);
      }, 2000);
    }, 1000);
  };

  return (
    <section className="bg-white text-text-primary py-16 md:py-20 text-center">
      <div className="max-w-xl mx-auto px-6 md:px-8">
        <h2 className="contact h2 font-montserrat text-3xl md:text-4xl font-bold mb-4 text-primary">
          Get In Touch
        </h2>
        <p className="font-source-serif text-base text-text-secondary mb-8">
          Have questions or want to learn more about our volunteer opportunities? Send us a message and we'll get back to you soon.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto text-left bg-surface p-6 rounded-lg shadow-md border border-border">
          <Input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting || isSubmitted}
            className="flex-grow border-none text-sm"
          />
          <Input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isSubmitting || isSubmitted}
            className="flex-grow border-none text-sm"
          />
          <Textarea
            name="message"
            placeholder="Your Message"
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
            {isSubmitting ? 'Sending...' : (isSubmitted ? '✓ Message Sent!' : 'Send Message')}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
