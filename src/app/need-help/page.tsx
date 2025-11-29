"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Import the Supabase client

export default function NeedHelpPage() {
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [location, setLocation] = useState('');
  const [typeOfNeed, setTypeOfNeed] = useState('food'); // Default to food
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('medium'); // Default to medium
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionStatus('Submitting...');
    setError('');

    // Basic client-side validation
    if (!contactInfo || !location || !typeOfNeed || !urgency) {
      setError('Please fill in all required fields (Contact Info, Location, Type of Need, Urgency).');
      setSubmissionStatus('');
      return;
    }

    try {
      const { data, error: supabaseError } = await supabase
        .from('help_requests')
        .insert([
          {
            name,
            contact_info: contactInfo,
            location,
            type_of_need: typeOfNeed,
            description,
            urgency,
          },
        ]);

      if (supabaseError) {
        throw supabaseError;
      }

      setSubmissionStatus('Help request submitted successfully!');
      // Optionally clear form or redirect
      setName('');
      setContactInfo('');
      setLocation('');
      setTypeOfNeed('food');
      setDescription('');
      setUrgency('medium');

    } catch (err: any) {
      console.error('Error submitting help request:', err);
      setError(err.message || 'An unexpected error occurred during submission.');
      setSubmissionStatus('');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-emerald-600 dark:text-emerald-400">
          I Need Help
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300">
          Please fill out this form so we can connect you with available volunteers.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Your Name (Optional)
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              Your Location (District/Town) <span className="text-red-500">*</span>
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
            <label htmlFor="typeOfNeed" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Type of Need <span className="text-red-500">*</span>
            </label>
            <select
              id="typeOfNeed"
              value={typeOfNeed}
              onChange={(e) => setTypeOfNeed(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="food">Food</option>
              <option value="shelter">Shelter</option>
              <option value="medical">Medical Assistance</option>
              <option value="transport">Transportation</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Description of Need (Optional)
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            ></textarea>
          </div>

          <div>
            <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Urgency <span className="text-red-500">*</span>
            </label>
            <select
              id="urgency"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
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
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Submit Request
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
