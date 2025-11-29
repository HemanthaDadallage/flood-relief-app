import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

interface RequestDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function RequestDetailsPage({ params }: RequestDetailsPageProps) {
  const cookieStore = cookies();
  const supabase = createServerClient();
  const requestId = params.id;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/admin/login');
  }

  // Verify if the user is an admin
  const { data: adminProfile, error: profileError } = await supabase
    .from('admin_profiles')
    .select('id, role')
    .eq('id', session.user.id)
    .single();

  if (profileError || !adminProfile) {
    redirect('/?message=You are not authorized to access the admin panel.');
  }

  // Fetch specific help request
  const { data: request, error: requestFetchError } = await supabase
    .from('help_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (requestFetchError || !request) {
    console.error('Error fetching help request:', requestFetchError);
    return (
      <main className="min-h-screen p-4 bg-gray-50 dark:bg-gray-900 text-red-600 dark:text-red-400">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Request Not Found</h1>
          <p>The help request you are looking for does not exist or an error occurred.</p>
          <Link href="/admin/dashboard" className="mt-4 inline-block text-emerald-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  // --- Server Actions ---
  const assignVolunteer = async (formData: FormData) => {
    'use server';
    const volunteerId = formData.get('volunteerId') as string;
    const currentRequestId = formData.get('requestId') as string;

    const serverSupabase = createServerClient();
    const { error } = await serverSupabase
      .from('help_requests')
      .update({ assigned_volunteer_id: volunteerId, status: 'in_progress' })
      .eq('id', currentRequestId);

    if (error) {
      console.error('Error assigning volunteer:', error);
      // Handle error, maybe show a toast
    } else {
      revalidatePath(`/admin/requests/${currentRequestId}`);
    }
  };

  const unassignVolunteer = async (formData: FormData) => {
    'use server';
    const currentRequestId = formData.get('requestId') as string;

    const serverSupabase = createServerClient();
    const { error } = await serverSupabase
      .from('help_requests')
      .update({ assigned_volunteer_id: null, status: 'open' })
      .eq('id', currentRequestId);

    if (error) {
      console.error('Error unassigning volunteer:', error);
    } else {
      revalidatePath(`/admin/requests/${currentRequestId}`);
    }
  };

  const updateRequestStatus = async (formData: FormData) => {
    'use server';
    const newStatus = formData.get('status') as string;
    const currentRequestId = formData.get('requestId') as string;

    const serverSupabase = createServerClient();
    const { error } = await serverSupabase
      .from('help_requests')
      .update({ status: newStatus })
      .eq('id', currentRequestId);

    if (error) {
      console.error('Error updating status:', error);
    } else {
      revalidatePath(`/admin/requests/${currentRequestId}`);
    }
  };

  const updateAdminNotes = async (formData: FormData) => {
    'use server';
    const newNotes = formData.get('adminNotes') as string;
    const currentRequestId = formData.get('requestId') as string;

    const serverSupabase = createServerClient();
    const { error } = await serverSupabase
      .from('help_requests')
      .update({ admin_notes: newNotes })
      .eq('id', currentRequestId);

    if (error) {
      console.error('Error updating admin notes:', error);
    } else {
      revalidatePath(`/admin/requests/${currentRequestId}`);
    }
  };


  // --- Matching Logic ---
  // Fetch volunteers based on location and type of help
  const { data: matchingVolunteers, error: volunteersFetchError } = await supabase
    .from('volunteers')
    .select('*')
    .eq('location', request.location) // Match by location
    .contains('type_of_help', [request.type_of_need]) // Match by type of need
    .eq('status', 'available'); // Only available volunteers

  if (volunteersFetchError) {
    console.error('Error fetching matching volunteers:', volunteersFetchError);
    // Continue rendering the page even if volunteers can't be fetched
  }

  const requestStatuses = ['open', 'in_progress', 'completed', 'cancelled'];

  return (
    <main className="min-h-screen p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-6">
          Help Request Details - {request.id.substring(0, 8)}...
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Request Information</h2>
            <p><strong>Name:</strong> {request.name || 'N/A'}</p>
            <p><strong>Contact:</strong> {request.contact_info}</p>
            <p><strong>Location:</strong> {request.location}</p>
            <p><strong>Type of Need:</strong> {request.type_of_need}</p>
            <p><strong>Urgency:</strong> {request.urgency}</p>
            <p><strong>Requested On:</strong> {new Date(request.created_at).toLocaleString()}</p>
            <p><strong>Description:</strong> {request.description || 'N/A'}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Status & Assignment</h2>
            <p className="mb-2"><strong>Current Status:</strong> <span className="font-semibold text-blue-600">{request.status}</span></p>

            <form action={updateRequestStatus} className="flex gap-2 items-center mb-4">
              <input type="hidden" name="requestId" value={request.id} />
              <label htmlFor="statusSelect" className="sr-only">Update Status</label>
              <select
                id="statusSelect"
                name="status"
                defaultValue={request.status}
                className="block w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {requestStatuses.map((statusOption) => (
                  <option key={statusOption} value={statusOption}>{statusOption.replace('_', ' ')}</option>
                ))}
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md shadow-md transition-colors text-sm"
              >
                Update
              </button>
            </form>

            <p className="mb-2"><strong>Assigned Volunteer:</strong> {request.assigned_volunteer_id ? (
              <span className="font-semibold">{request.assigned_volunteer_id}</span>
            ) : (
              'Not yet assigned.'
            )}</p>
            {request.assigned_volunteer_id && (
                <form action={unassignVolunteer}>
                    <input type="hidden" name="requestId" value={request.id} />
                    <button type="submit" className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md shadow-md transition-colors text-sm">
                        Unassign Volunteer
                    </button>
                </form>
            )}

            <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-100">Admin Notes</h3>
            <form action={updateAdminNotes}>
                <input type="hidden" name="requestId" value={request.id} />
                <textarea
                    name="adminNotes"
                    rows={3}
                    defaultValue={request.admin_notes || ''}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                ></textarea>
                <button
                    type="submit"
                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-md transition-colors text-sm"
                >
                    Save Notes
                </button>
            </form>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Suggested Volunteers for {request.type_of_need} in {request.location}
        </h2>
        {matchingVolunteers && matchingVolunteers.length > 0 ? (
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Can Help With
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Availability
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {matchingVolunteers.map((volunteer) => (
                  <tr key={volunteer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-50">{volunteer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-50">{volunteer.contact_info}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-50">{volunteer.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-50">
                      {volunteer.type_of_help.join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-50">{volunteer.availability || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <form action={assignVolunteer}>
                          <input type="hidden" name="volunteerId" value={volunteer.id} />
                          <input type="hidden" name="requestId" value={request.id} />
                          <button type="submit" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-2">Assign</button>
                      </form>
                      {/* TODO: Add contact mechanism */}
                      <button className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300">Contact</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-300 mb-8">No matching volunteers found for this request based on location and type of need.</p>
        )}

        <Link href="/admin/dashboard" className="inline-block px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-medium rounded-md shadow-md transition-colors">
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
