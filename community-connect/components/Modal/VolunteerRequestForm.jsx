import React, { useState } from 'react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Icon from '../ui/Icon';

const VolunteerRequestForm = ({ onSubmit, onCancel, onCompanyLoginClick }) => {
  const [formData, setFormData] = useState({
    projectTitle: '',
    category: '',
    projectDescription: '',
    eventDate: '',
    volunteersNeeded: '',
    location: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call or data processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onSubmit(formData);
    setIsSubmitting(false);
    setFormData({ // Reset form after submission
      projectTitle: '',
      category: '',
      projectDescription: '',
      eventDate: '',
      volunteersNeeded: '',
      location: '',
    });
  };

  return (
    <>
      <div className="px-6 pt-6 flex justify-between items-center">
        <h2 className="font-montserrat text-2xl font-bold text-taylor-purple m-0">Request Volunteers</h2>
        <button
          className="bg-none border-none text-2xl cursor-pointer text-text-secondary p-2 rounded-md transition-all duration-200 hover:bg-surface hover:text-text-primary"
          onClick={onCancel}
          aria-label="Close modal"
        >
          &times;
        </button>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-5 animate-slideUp">
            <label htmlFor="projectTitle" className="block font-montserrat font-semibold text-sm text-text-primary mb-2">
              Project Title *
            </label>
            <Input
              type="text"
              id="projectTitle"
              name="projectTitle"
              value={formData.projectTitle}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-5 animate-slideUp" style={{ animationDelay: '50ms' }}>
            <label htmlFor="category" className="block font-montserrat font-semibold text-sm text-text-primary mb-2">
              Project Category *
            </label>
            <Select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              <option value="community">Community</option>
              <option value="education">Education</option>
              <option value="environment">Environment</option>
              <option value="health">Health</option>
              <option value="fundraising">Fundraising</option>
              <option value="other">Other</option>
            </Select>
          </div>

          <div className="mb-5 animate-slideUp" style={{ animationDelay: '100ms' }}>
            <label htmlFor="projectDescription" className="block font-montserrat font-semibold text-sm text-text-primary mb-2">
              Project Description *
            </label>
            <Textarea
              id="projectDescription"
              name="projectDescription"
              rows="3"
              placeholder="Describe what volunteers will be doing and the impact of this project..."
              value={formData.projectDescription}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="animate-slideUp" style={{ animationDelay: '150ms' }}>
              <label htmlFor="eventDate" className="block font-montserrat font-semibold text-sm text-text-primary mb-2">
                Event Date *
              </label>
              <Input
                type="date"
                id="eventDate"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="animate-slideUp" style={{ animationDelay: '200ms' }}>
              <label htmlFor="volunteersNeeded" className="block font-montserrat font-semibold text-sm text-text-primary mb-2">
                Volunteers Needed *
              </label>
              <Input
                type="number"
                id="volunteersNeeded"
                name="volunteersNeeded"
                min="1"
                max="100"
                value={formData.volunteersNeeded}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-5 animate-slideUp" style={{ animationDelay: '250ms' }}>
            <label htmlFor="location" className="block font-montserrat font-semibold text-sm text-text-primary mb-2">
              Location *
            </label>
            <Input
              type="text"
              id="location"
              name="location"
              placeholder="Address or general area"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border-light mt-6">
            <Button type="button" variant="cancel" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
        
        <div className="text-center mt-6 pt-4 border-t border-border-light">
          <p className="text-sm text-text-secondary mb-2">Are you a company looking to post volunteer opportunities?</p>
          <button 
            onClick={onCompanyLoginClick}
            className="text-accent1 hover:text-primary font-medium text-sm focus:outline-none"
          >
            Login as Company
          </button>
        </div>
      </div>
    </>
  );
};

export default VolunteerRequestForm;
