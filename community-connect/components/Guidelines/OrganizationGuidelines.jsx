import React from 'react';

const OrganizationGuidelines = () => {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className="bg-green-500 rounded-full p-2 mr-3">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-green-900 font-montserrat">Organization Safety Standards</h3>
      </div>
      
      <div className="space-y-3 text-sm text-green-800">
        <div className="flex items-start">
          <span className="text-red-500 font-bold mr-2">•</span>
          <span><strong>Never allow solo volunteers:</strong> Ensure volunteers always work in pairs or groups</span>
        </div>
        
        <div className="flex items-start">
          <span className="text-red-500 font-bold mr-2">•</span>
          <span><strong>Provide proper supervision:</strong> Have designated staff members oversee volunteer activities</span>
        </div>
        
        <div className="flex items-start">
          <span className="text-red-500 font-bold mr-2">•</span>
          <span><strong>Maintain safe environments:</strong> Ensure all volunteer locations are well-lit and secure</span>
        </div>
        
        <div className="flex items-start">
          <span className="text-red-500 font-bold mr-2">•</span>
          <span><strong>Respect boundaries:</strong> Never put students in uncomfortable or dangerous situations</span>
        </div>
        
        <div className="flex items-start">
          <span className="text-red-500 font-bold mr-2">•</span>
          <span><strong>Clear communication:</strong> Provide detailed instructions and emergency contact information</span>
        </div>
        
        <div className="flex items-start">
          <span className="text-red-500 font-bold mr-2">•</span>
          <span><strong>Zero tolerance for abuse:</strong> Any form of harassment or exploitation is strictly prohibited</span>
        </div>
        
        <div className="flex items-start">
          <span className="text-red-500 font-bold mr-2">•</span>
          <span><strong>Background checks:</strong> Ensure all staff working with volunteers have proper clearances</span>
        </div>
        
        <div className="flex items-start">
          <span className="text-red-500 font-bold mr-2">•</span>
          <span><strong>Emergency protocols:</strong> Have clear procedures for handling accidents or incidents</span>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-green-200 rounded-md">
        <p className="text-xs text-green-900 font-semibold">
          🛡️ <strong>Commitment:</strong> By creating opportunities on this platform, you commit to maintaining the highest standards of safety and respect for all volunteers. Their well-being is our shared responsibility.
        </p>
      </div>
    </div>
  );
};

export default OrganizationGuidelines;