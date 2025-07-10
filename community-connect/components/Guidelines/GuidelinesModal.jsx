import React, { useState } from 'react';
import Modal from '../Modal/Modal.jsx';
import UserGuidelines from './UserGuidelines.jsx';
import OrganizationGuidelines from './OrganizationGuidelines.jsx';

const GuidelinesModal = ({ isOpen, onClose, userType = 'user' }) => {
  const [activeTab, setActiveTab] = useState(userType);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Safety Guidelines">
      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'user'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('user')}
          >
            For Volunteers
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'organization'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('organization')}
          >
            For Organizations
          </button>
        </div>

        {/* Guidelines Content */}
        <div className="max-h-96 overflow-y-auto">
          {activeTab === 'user' ? <UserGuidelines /> : <OrganizationGuidelines />}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              These guidelines are designed to ensure everyone&apos;s safety and well-being.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GuidelinesModal;