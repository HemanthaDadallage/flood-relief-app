"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function WantToHelpPage() {
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [location, setLocation] = useState('');
  const [typeOfHelp, setTypeOfHelp] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleTypeOfHelpChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions).map((option) => option.value);
    setTypeOfHelp(options);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmissionStatus('');
    setError('');

    // Basic client-side validation
    if (!name || !contactInfo || !location || typeOfHelp.length === 0) {
      setError('Please fill in all required fields (Name, Contact Info, Location, Type of Help).');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    try {
      const { error: supabaseError } = await supabase
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

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again later.';
      console.error('Error submitting volunteer offer:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = () => {
    setSubmissionStatus('');
    setError('');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      <div className="w-full max-w-xl space-y-4">
        <div className="mx-auto max-w-md rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-xs text-blue-900 shadow-sm dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-100">
          <p className="font-semibold uppercase tracking-wide text-[0.7rem] text-blue-700 dark:text-blue-300">
            Step 1 · Tell us how you can help
          </p>
          <p className="mt-1">
            Your skills and availability help us match you with people who need you most in your area.
          </p>
        </div>

        <div className="w-full max-w-md p-8 space-y-6 bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-lg border border-gray-200/70 dark:border-gray-700/80">
          <h1 className="text-3xl font-bold text-center text-emerald-600 dark:text-emerald-400">
            I Want to Help
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 text-sm">
            Thank you for your willingness to help. Tell us where you can go and what kind of support you
            can offer.
          </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onFocus={handleFocus}
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
              onFocus={handleFocus}
              onChange={(e) => setContactInfo(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              We&apos;ll use this to contact you about matching help requests in your area.
            </p>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Location You Can Cover (District/Town) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onFocus={handleFocus}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Tell us the districts or towns you can reasonably travel to in an emergency.
            </p>
          </div>

          <div>
            <label htmlFor="typeOfHelp" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Type of Help You Can Offer <span className="text-red-500">*</span>
            </label>
            <select
              id="typeOfHelp"
              multiple
              value={typeOfHelp}
              onFocus={handleFocus}
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
              onFocus={handleFocus}
              onChange={(e) => setAvailability(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {submissionStatus && (
            <div
              data-testid="submission-status"
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
              data-testid="error-message"
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
            className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading && (
              <span className="h-3 w-3 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
            )}
            {loading ? 'Submitting...' : 'Submit Offer'}
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
