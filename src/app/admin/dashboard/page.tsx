import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export const revalidate = 0;

async function getHelpRequests() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/admin/login');
  }

  // Check if the user is an admin
  const { data: adminProfile, error: adminError } = await supabase
    .from('admin_profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (adminError || !adminProfile) {
    // This is a basic check. You might want to redirect to a more specific "unauthorized" page.
    return redirect('/admin/login?message=You are not authorized to access this page.');
  }

  const { data, error } = await supabase
    .from('help_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching help requests:', error);
    return [];
  }

  return data;
}

async function getVolunteers() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/admin/login');
  }

  const { data: volunteers, error } = await supabase
    .from('volunteers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching volunteers:', error);
    return [];
  }

  return volunteers;
}

export default async function AdminDashboard() {
  async function updateHelpRequestStatus(formData: FormData) {
    'use server';

    const id = formData.get('id')?.toString();
    const status = formData.get('status')?.toString();
    const allowedStatuses = ['open', 'in_progress', 'completed', 'cancelled'];

    if (!id || !status || !allowedStatuses.includes(status)) {
      return;
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return redirect('/admin/login');
    }

    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!adminProfile) {
      return redirect('/admin/login?message=You are not authorized to access this page.');
    }

    const { error } = await supabase
      .from('help_requests')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating help request status:', error);
      return;
    }

    revalidatePath('/admin/dashboard');
  }

  const helpRequests = await getHelpRequests();
  const volunteers = await getVolunteers();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          {/* Add a logout button or user profile dropdown here */}
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Incoming Help Requests</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {helpRequests.length > 0 ? `Showing ${helpRequests.length} requests.` : 'No active help requests.'}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type of Need
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Urgency
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View Details</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {helpRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {new Date(request.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 max-w-xs">
                      <div className="font-medium">{request.name || '—'}</div>
                      <div className="text-gray-600 dark:text-gray-300 truncate">{request.contact_info}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {request.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {request.type_of_need}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-md">
                      <div className="truncate">
                        {request.description ? request.description : 'No description provided.'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.urgency === 'high' ? 'bg-red-100 text-red-800' :
                        request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {request.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === 'open' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-y-1">
                      <Link href={`/admin/requests/${request.id}`} className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-200 block">
                        View Details
                      </Link>
                      <form action={updateHelpRequestStatus} className="flex flex-wrap gap-1 justify-end">
                        <input type="hidden" name="id" value={request.id} />
                        <button
                          type="submit"
                          name="status"
                          value="in_progress"
                          className="rounded border border-amber-300 px-2 py-1 text-xs text-amber-800 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/30"
                        >
                          Mark In Progress
                        </button>
                        <button
                          type="submit"
                          name="status"
                          value="completed"
                          className="rounded border border-green-300 px-2 py-1 text-xs text-green-800 hover:bg-green-50 dark:border-green-700 dark:text-green-200 dark:hover:bg-green-900/30"
                        >
                          Mark Done
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {helpRequests.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No help requests found.</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mt-8">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Volunteer Offers</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {volunteers.length > 0 ? `Showing ${volunteers.length} volunteers.` : 'No volunteer offers yet.'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
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
                    Availability
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Types of Help
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {volunteers.map((volunteer) => (
                  <tr key={volunteer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {volunteer.created_at ? new Date(volunteer.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {volunteer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {volunteer.contact_info}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {volunteer.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {volunteer.availability || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {Array.isArray(volunteer.type_of_help) ? volunteer.type_of_help.join(', ') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {volunteers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No volunteers have signed up yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
