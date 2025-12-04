import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export const revalidate = 0; // Revalidate data on every request

// Fetch details for a single help request, including assigned volunteer info
async function getHelpRequestDetails(id: string) {
  const cookieStore = cookies();
  const supabase = createServerClient({ cookies: () => cookieStore });

  const { data, error } = await supabase
    .from('help_requests')
    .select(`
      *,
      volunteer:volunteers ( id, name, contact_info, location )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching help request details:', error);
    return null;
  }
  return data;
}

// Fetch suggested volunteers based on location and type of need
async function getSuggestedVolunteers(location: string, typeOfNeed: string) {
  const cookieStore = cookies();
  const supabase = createServerClient({ cookies: () => cookieStore });

  const { data, error } = await supabase
    .from('volunteers')
    .select('*')
    .ilike('location', `%${location}%`)
    .eq('status', 'available')
    .contains('type_of_help', [typeOfNeed]);

  if (error) {
    console.error('Error fetching suggested volunteers:', error);
    return [];
  }
  return data;
}

export default async function RequestDetailsPage({ params }: { params: { id: string } }) {
  const request = await getHelpRequestDetails(params.id);

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Request not found</h1>
        <Link href="/admin/dashboard" className="mt-4 inline-block text-emerald-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const suggestedVolunteers = await getSuggestedVolunteers(request.location, request.type_of_need);

  // Server Action to assign a volunteer
  async function assignVolunteer(formData: FormData) {
    'use server';

    const volunteerId = formData.get('volunteerId')?.toString();
    const requestId = formData.get('requestId')?.toString();

    if (!volunteerId || !requestId) {
      console.error('Missing volunteerId or requestId');
      return;
    }

    const cookieStore = cookies();
    const supabase = createServerClient({ cookies: () => cookieStore });

    // In a real app, you'd wrap these in a transaction (e.g., via a db function)
    const { error: requestUpdateError } = await supabase
      .from('help_requests')
      .update({ status: 'in_progress', assigned_volunteer_id: volunteerId })
      .eq('id', requestId);

    if (requestUpdateError) {
      console.error('Error updating help request:', requestUpdateError);
      return;
    }

    const { error: volunteerUpdateError } = await supabase
      .from('volunteers')
      .update({ status: 'assigned' })
      .eq('id', volunteerId);

    if (volunteerUpdateError) {
      console.error('Error updating volunteer:', volunteerUpdateError);
      // Note: You might want to handle rollback logic here
      return;
    }

    revalidatePath(`/admin/requests/${requestId}`);
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/dashboard" className="text-sm text-emerald-600 hover:underline">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            Request Details
          </h1>
        </div>

        {/* Request Details Section */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Help Request #{request.id.substring(0, 8)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {/* ... request details fields ... */}
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400">Name</p>
              <p className="text-gray-900 dark:text-gray-100">{request.name || 'Not provided'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400">Contact Info</p>
              <p className="text-gray-900 dark:text-gray-100">{request.contact_info}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400">Location</p>
              <p className="text-gray-900 dark:text-gray-100">{request.location}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400">Type of Need</p>
              <p className="text-gray-900 dark:text-gray-100">{request.type_of_need}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400">Urgency</p>
              <p className="text-gray-900 dark:text-gray-100">{request.urgency}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400">Status</p>
              <p className="text-gray-900 dark:text-gray-100 font-semibold">{request.status}</p>
            </div>
            <div className="md:col-span-2">
              <p className="font-medium text-gray-500 dark:text-gray-400">Description</p>
              <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{request.description || 'No description provided.'}</p>
            </div>
          </div>
        </div>

        {/* Assigned Volunteer Section */}
        {request.status !== 'open' && request.volunteer && (
          <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-100 mb-4">
              Assigned Volunteer
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-500 dark:text-gray-400">Name</p>
                  <p className="text-gray-900 dark:text-gray-100">{request.volunteer.name}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500 dark:text-gray-400">Contact</p>
                  <p className="text-gray-900 dark:text-gray-100">{request.volunteer.contact_info}</p>
                </div>
            </div>
          </div>
        )}

        {/* Suggested Volunteers Section */}
        {request.status === 'open' && (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Suggested Volunteers</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {suggestedVolunteers.length > 0
                  ? `Found ${suggestedVolunteers.length} matching volunteers.`
                  : 'No matching volunteers found.'}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Availability</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {suggestedVolunteers.map((volunteer) => (
                    <tr key={volunteer.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{volunteer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{volunteer.contact_info}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{volunteer.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{volunteer.availability || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <form action={assignVolunteer}>
                            <input type="hidden" name="volunteerId" value={volunteer.id} />
                            <input type="hidden" name="requestId" value={request.id} />
                            <button type="submit" className="text-emerald-600 hover:text-emerald-900 disabled:text-gray-400">
                                Assign
                            </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {suggestedVolunteers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No volunteers found matching the request criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}