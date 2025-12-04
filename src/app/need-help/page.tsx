"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmissionStatus('');
    setError('');

    // Basic client-side validation
    if (!contactInfo || !location || !typeOfNeed || !urgency) {
      setError('Please fill in all required fields (Contact Info, Location, Type of Need, Urgency).');
      return;
    }

    const supabase = createClient();
    try {
      const { error: supabaseError } = await supabase
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

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again later.';
      console.error('Error submitting help request:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      <div className="w-full max-w-xl space-y-4">
        <div className="mx-auto max-w-md rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-xs text-emerald-900 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100">
          <p className="font-semibold uppercase tracking-wide text-[0.7rem] text-emerald-700 dark:text-emerald-300">
            Step 1 · Tell us what you need
          </p>
          <p className="mt-1">
            Your details help us find a nearby volunteer quickly. Only admins coordinating relief efforts
            can see this information.
          </p>
        </div>

        <div className="w-full max-w-md p-8 space-y-6 bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-lg border border-gray-200/70 dark:border-gray-700/80">
          <h1 className="text-3xl font-bold text-center text-emerald-600 dark:text-emerald-400">
            I Need Help
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 text-sm">
            Please fill out this form so we can connect you with available volunteers as quickly and safely
            as possible.
          </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              We&apos;ll only use this to connect you with someone who can help.
            </p>
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
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Please be as specific as you can (e.g. district, town, nearest landmark).
            </p>
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
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Any extra details (number of people, special needs, access issues) help volunteers prepare.
            </p>
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
            <div
              role="status"
              aria-live="polite"
              className="flex items-start gap-2 rounded-md border border-green-600/40 bg-green-600/10 px-3 py-2 text-sm text-green-800 dark:text-green-100"
            >
              <span className="mt-0.5 h-2 w-2 rounded-full bg-green-500" />
              <p>{submissionStatus}</p>
            </div>
          )}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-2 rounded-md border border-red-600/40 bg-red-600/10 px-3 py-2 text-sm text-red-800 dark:text-red-100"
            >
              <span className="mt-0.5 h-2 w-2 rounded-full bg-red-500" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400"
          >
            {loading && (
              <span className="h-3 w-3 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
            )}
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>

        <button
          onClick={() => router.push('/')}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 mt-4"
        >
          Back to Home
        </button>
      </div>
      </div>
    </main>
  );
}
