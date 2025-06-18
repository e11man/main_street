import React from 'react';
import Link from 'next/link';
import Button from '../ui/Button';

const VolunteerRequestForm = ({ onCancel }) => {
  const handleEmailClick = () => {
    const subject = encodeURIComponent('Interest in Community Connect Beta Access');
    const body = encodeURIComponent('Hi,\n\nI\'m interested in learning more about Community Connect and getting access to post volunteer opportunities.\n\nPlease let me know how I can get involved.\n\nThank you!');
    window.open(`mailto:info@communityconnect.com?subject=${subject}&body=${body}`);
  };

  return (
    <>
      <div className="px-6 pt-6 flex justify-between items-center">
        <h2 className="font-montserrat text-2xl font-bold text-primary m-0">Request Volunteers</h2>
        <button
          className="bg-none border-none text-2xl cursor-pointer text-text-secondary p-2 rounded-md transition-all duration-200 hover:bg-surface hover:text-text-primary"
          onClick={onCancel}
          aria-label="Close modal"
        >
          &times;
        </button>
      </div>
      <div className="p-6 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent1/10 rounded-full mb-4">
            <span className="text-2xl">🚧</span>
          </div>
          <h3 className="font-montserrat text-xl font-semibold text-text-primary mb-3">
            We're in Beta!
          </h3>
          <p className="text-text-secondary mb-4 leading-relaxed">
            Community Connect is currently in beta testing. We're only allowing verified companies and organizations to post volunteer opportunities at this time.
          </p>
          <p className="text-text-secondary mb-6 leading-relaxed">
            Individual volunteer requests will be available soon!
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-surface rounded-lg border border-border-light">
            <h4 className="font-montserrat font-semibold text-text-primary mb-2">
              Are you a company or organization?
            </h4>
            <p className="text-sm text-text-secondary mb-3">
              Companies can already post volunteer opportunities
            </p>
            <Link 
              href="/company-login"
              className="inline-block"
            >
              <Button variant="primary" className="w-full">
                Company Login
              </Button>
            </Link>
          </div>

          <div className="p-4 bg-surface rounded-lg border border-border-light">
            <h4 className="font-montserrat font-semibold text-text-primary mb-2">
              Want to be notified when we launch?
            </h4>
            <p className="text-sm text-text-secondary mb-3">
              Get in touch and we'll let you know when individual requests are available
            </p>
            <Button 
              variant="secondary" 
              onClick={handleEmailClick}
              className="w-full"
            >
              Email for More Info
            </Button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border-light">
          <Button type="button" variant="cancel" onClick={onCancel}>
            Close
          </Button>
        </div>
      </div>
    </>
  );
};

export default VolunteerRequestForm;
