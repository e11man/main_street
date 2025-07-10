import React from 'react';

const UserGuidelines = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className="bg-blue-500 rounded-full p-2 mr-3">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-blue-900 font-montserrat">Safety Guidelines for Volunteers</h3>
      </div>
      
      <div className="space-y-3 text-sm text-blue-800">
        <div className="flex items-start">
          <span className="text-red-500 font-bold mr-2">•</span>
          <span><strong>Never go alone:</strong> Always volunteer with at least one other person you trust</span>
        </div>
        
        <div className="flex items-start">
          <span className="text-red-500 font-bold mr-2">•</span>
          <span><strong>Trust your instincts:</strong> If something feels uncomfortable or unsafe, leave immediately</span>
        </div>
        
        <div className="flex items-start">
          <span className="text-red-500 font-bold mr-2">•</span>
          <span><strong>Stay in public areas:</strong> Avoid isolated locations, especially during evening hours</span>
        </div>
        
        <div className="flex items-start">
          <span className="text-red-500 font-bold mr-2">•</span>
          <span><strong>Keep your phone charged:</strong> Always have a way to contact someone in case of emergency</span>
        </div>
        
        <div className="flex items-start">
          <span className="text-red-500 font-bold mr-2">•</span>
          <span><strong>Let someone know:</strong> Tell a friend or family member where you&apos;re going and when you&apos;ll be back</span>
        </div>
        
        <div className="flex items-start">
          <span className="text-red-500 font-bold mr-2">•</span>
          <span><strong>Report concerns:</strong> If you experience anything inappropriate, report it immediately to campus authorities</span>
        </div>
        
        <div className="flex items-start">
          <span className="text-red-500 font-bold mr-2">•</span>
          <span><strong>Your safety comes first:</strong> No volunteer opportunity is worth compromising your personal safety</span>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-200 rounded-md">
        <p className="text-xs text-blue-900 font-semibold">
          💡 <strong>Remember:</strong> These guidelines are designed to keep you safe while making a positive impact in your community. When in doubt, prioritize your safety above all else.
        </p>
      </div>
    </div>
  );
};

export default UserGuidelines;