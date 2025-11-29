"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Import the Supabase client

export default function WantToHelpPage() {
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [location, setLocation] = useState('');
  const [typeOfHelp, setTypeOfHelp] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleTypeOfHelpChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions).map((option) => option.value);
    setTypeOfHelp(options);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionStatus('Submitting...');
    setError('');

    // Basic client-side validation
    if (!name || !contactInfo || !location || typeOfHelp.length === 0) {
      setError('Please fill in all required fields (Name, Contact Info, Location, Type of Help).');
      setSubmissionStatus('');
      return;
    }

    try {
      const { data, error: supabaseError } = await supabase
        .from('volunteers')
        .insert([
          {
            name,
            contact_info: contactInfo,
            location,
            type_of_help: typeOfHelp,
            availability,
          },
        ]);

      if (supabaseError) {
        throw supabaseError;
      }

      setSubmissionStatus('Volunteer offer submitted successfully!');
      // Optionally clear form or redirect
      setName('');
      setContactInfo('');
      setLocation('');
      setTypeOfHelp([]);
      setAvailability('');

    } catch (err: any) {
      console.error('Error submitting volunteer offer:', err);
      setError(err.message || 'An unexpected error occurred during submission.');
      setSubmissionStatus('');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-emerald-600 dark:text-emerald-400">
          I Want to Help
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300">
          Thank you for your willingness to help! Please tell us what you can offer.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Contact Info (Phone Number/Email) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="contactInfo"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Location You Can Cover (District/Town) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="typeOfHelp" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Type of Help You Can Offer <span className="text-red-500">*</span>
            </label>
            <select
              id="typeOfHelp"
              multiple
              value={typeOfHelp}
              onChange={handleTypeOfHelpChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="driver">Driving/Transportation</option>
              <option value="shelter">Offer Shelter</option>
              <option value="medical_skills">Medical Skills</option>
              <option value="food_delivery">Food Delivery</option>
              <option value="other">Other</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Hold Ctrl or Cmd to select multiple options</p>
          </div>

          <div>
            <label htmlFor="availability" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Your Availability (e.g., Weekends, Anytime) (Optional)
            </label>
            <input
              type="text"
              id="availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {submissionStatus && (
            <p className="text-center text-green-600 dark:text-green-400 font-medium">
              {submissionStatus}
            </p>
          )}
          {error && (
            <p className="text-center text-red-600 dark:text-red-400 font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Submit Offer
          </button>
        </form>

        <button
          onClick={() => router.push('/')}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 mt-4"
        >
          Back to Home
        </button>
      </div>
    </main>
  );
}
