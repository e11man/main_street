import React, { useState } from 'react';
import Head from 'next/head';
import Header from '../components/Header/Header.jsx';
import Footer from '../components/Footer/Footer.jsx';
import UserGuidelines from '../components/Guidelines/UserGuidelines.jsx';
import OrganizationGuidelines from '../components/Guidelines/OrganizationGuidelines.jsx';

export default function GuidelinesPage() {
  const [activeTab, setActiveTab] = useState('user');

  return (
    <>
      <Head>
        <title>Safety Guidelines - Community Connect</title>
        <meta name="description" content="Safety guidelines for volunteers and organizations using Community Connect" />
      </Head>
      
      <Header openModal={() => {}} />
      
      <main className="min-h-screen bg-surface py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary mb-4 font-montserrat">
              Safety Guidelines
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              These guidelines are designed to ensure everyone's safety and well-being while participating in volunteer opportunities.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex border border-gray-200 rounded-lg p-1 bg-white shadow-sm">
              <button
                className={`px-6 py-3 font-medium text-sm rounded-md transition-colors ${
                  activeTab === 'user'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('user')}
              >
                For Volunteers
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm rounded-md transition-colors ${
                  activeTab === 'organization'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('organization')}
              >
                For Organizations
              </button>
            </div>
          </div>

          {/* Guidelines Content */}
          <div className="max-w-3xl mx-auto">
            {activeTab === 'user' ? <UserGuidelines /> : <OrganizationGuidelines />}
          </div>

          {/* Additional Information */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Important Notes</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• These guidelines are mandatory for all users of the Community Connect platform</li>
                <li>• Violations of these guidelines may result in account suspension or removal</li>
                <li>• If you witness or experience any violations, please report them immediately</li>
                <li>• Your safety and well-being are our top priority</li>
                <li>• These guidelines are regularly reviewed and updated to ensure maximum safety</li>
              </ul>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Questions about these guidelines? Contact us at{' '}
              <a href="mailto:safety@communityconnect.com" className="text-blue-600 hover:text-blue-800">
                safety@communityconnect.com
              </a>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}