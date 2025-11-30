import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import WantToHelpPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        data: [
          {
            id: '123',
            name: 'Test Volunteer',
            contact_info: 'volunteer@example.com',
            location: 'Test Location',
            type_of_help: ['food_delivery'],
            availability: 'Weekends',
          },
        ],
        error: null,
      })),
    })),
  },
}));

describe('WantToHelpPage', () => {
  it('renders the form correctly', () => {
    render(<WantToHelpPage />);
    expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contact Info/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Location You Can Cover/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Type of Help You Can Offer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Availability/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Offer/i })).toBeInTheDocument();
  });

  it('shows an error message if required fields are not filled', async () => {
    render(<WantToHelpPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Submit Offer/i }));
    });
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(/Please fill in all required fields/i);
    });
  });

  it('submits the form successfully', async () => {
    render(<WantToHelpPage />);
    fireEvent.input(screen.getByLabelText(/Your Name/i), { target: { value: 'Test Volunteer' } });
    fireEvent.input(screen.getByLabelText(/Contact Info/i), { target: { value: 'volunteer@example.com' } });
    fireEvent.input(screen.getByLabelText(/Location You Can Cover/i), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByLabelText(/Type of Help You Can Offer/i), { target: { value: ['food_delivery'] } });
    fireEvent.input(screen.getByLabelText(/Your Availability/i), { target: { value: 'Weekends' } });

    fireEvent.click(screen.getByRole('button', { name: /Submit Offer/i }));

    await waitFor(() => {
      expect(screen.getByText(/Volunteer offer submitted successfully!/i)).toBeInTheDocument();
    });
  });
});
