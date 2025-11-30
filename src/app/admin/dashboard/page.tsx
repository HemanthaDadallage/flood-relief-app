import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

type AdminDashboardPageProps = {
  searchParams?: {
    status?: string;
    urgency?: string;
    location?: string;
    q?: string;
  };
};

const statusOptions = ['all', 'open', 'in_progress', 'completed', 'cancelled'];
const urgencyOptions = ['all', 'high', 'medium', 'low'];

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll();
        },
      },
    }
  );

  const statusFilter = searchParams?.status || 'all';
  const urgencyFilter = searchParams?.urgency || 'all';
  const locationFilter = searchParams?.location || '';
  const searchTerm = searchParams?.q || '';

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // This should ideally be caught by middleware, but good to have a fallback
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

  // Fetch help requests
  let query = supabase.from('help_requests').select('*').order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  if (urgencyFilter && urgencyFilter !== 'all') {
    query = query.eq('urgency', urgencyFilter);
  }

  if (locationFilter) {
    query = query.ilike('location', `%${locationFilter}%`);
  }

  if (searchTerm) {
    query = query.or(
      `name.ilike.%${searchTerm}%,contact_info.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
    );
  }

  const { data: helpRequests, error: requestsError } = await query;

  if (requestsError) {
    console.error('Error fetching help requests:', requestsError);
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 text-red-600 dark:text-red-400">
        Error loading help requests.
      </main>
    );
  }

  const handleLogout = async () => {
    'use server';
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async getAll() {
            return (await cookieStore).getAll();
          },
        },
      }
    );
    await supabase.auth.signOut();
    redirect('/admin/login');
  };

  return (
    <main className="min-h-screen p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-6 text-center md:text-left">
          Admin Dashboard
        </h1>

        <div className="flex justify-between items-center mb-6">
          <p className="text-lg">Welcome, Admin!</p>
          <form action={handleLogout}>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-md transition-colors"
            >
              Logout
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Status</label>
              <select
                name="status"
                defaultValue={statusFilter}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>{option.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Urgency</label>
              <select
                name="urgency"
                defaultValue={urgencyFilter}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {urgencyOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Location</label>
              <input
                type="text"
                name="location"
                defaultValue={locationFilter}
                placeholder="e.g., Colombo"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Search</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  name="q"
                  defaultValue={searchTerm}
                  placeholder="Name, contact, description"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md shadow-md transition-colors text-sm"
                >
                  Filter
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Help Requests
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Showing {helpRequests?.length ?? 0} request(s){statusFilter !== 'all' ? ` with status "${statusFilter.replace('_', ' ')}"` : ''}{urgencyFilter !== 'all' ? ` and urgency "${urgencyFilter}"` : ''}{locationFilter ? ` in "${locationFilter}"` : ''}{searchTerm ? ` matching "${searchTerm}"` : ''}.
          </p>
          {helpRequests && helpRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created At
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Need
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Urgency
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {helpRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-50">{request.id.substring(0, 8)}...</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-50">
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-50">{request.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-50">{request.contact_info}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-50">{request.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-50">{request.type_of_need}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-50">{request.urgency}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-50">{request.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href={`/admin/requests/${request.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">No help requests found.</p>
          )}
        </div>
      </div>
    </main>
  );
}
