import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for use-places-autocomplete to handle SSR
let usePlacesAutocomplete;

if (typeof window !== 'undefined') {
  // Only import on client side
  usePlacesAutocomplete = require('use-places-autocomplete').default;
} else {
  // Server-side mock
  usePlacesAutocomplete = () => ({
    ready: false,
    value: '',
    suggestions: { status: 'MOCK', data: [] },
    setValue: () => {},
    clearSuggestions: () => {},
  });
}

const GooglePlacesAutocomplete = ({ value, onChange, onSelect, placeholder }) => {
  // --- RULES OF HOOKS ---
  // Because `usePlacesAutocomplete` is now a valid function in both server and
  // client environments (either the real hook or our mock), we can call it
  // unconditionally. This satisfies the Rules of Hooks and prevents the
  // previous runtime errors.
  const {
    ready,
    value: inputValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 300,
    // requestOptions: { /* ... */ },
  });

  // This effect syncs the component's internal state with the `value` prop
  // from the parent component, making this a "controlled" component.
  useEffect(() => {
    // We add a `ready` check to ensure we only try to set the value
    // when the real hook is initialized on the client.
    if (ready && value !== inputValue) {
      setValue(value, false);
    }
  }, [value, inputValue, setValue, ready]);

  const handleInput = (e) => {
    setValue(e.target.value);
    if (onChange) {
      onChange(e);
    }
  };

  const handleSelect = (description) => {
    setValue(description, false);
    clearSuggestions();
    if (onSelect) {
      onSelect(description);
    }
  };

  return (
    <div className="relative">
      <input
        value={inputValue}
        onChange={handleInput}
        // `ready` is `false` on the server (from our mock).
        // It becomes `true` on the client once the Google Maps script is loaded.
        disabled={!ready}
        placeholder={placeholder || 'Enter a location'}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        autoComplete="off"
        name="location"
        id="location"
      />
      {/* Suggestions will only render on the client when ready and available. */}
      {ready && status === 'OK' && (
        <ul className="absolute z-10 bg-white border border-gray-200 w-full mt-1 rounded shadow-lg max-h-56 overflow-y-auto">
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
              onClick={() => handleSelect(description)}
            >
              {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GooglePlacesAutocomplete;
