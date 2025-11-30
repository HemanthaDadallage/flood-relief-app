import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NeedHelpPage from './page';
import React from 'react'; // Import React for useState mocking

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
            name: 'Test User',
            contact_info: 'test@example.com',
            location: 'Test Location',
            type_of_need: 'food',
            description: 'Test description',
            urgency: 'high',
          },
        ],
        error: null,
      })),
    })),
  },
}));

describe('NeedHelpPage', () => {
  it('renders the form correctly', () => {
    render(<NeedHelpPage />);
    expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contact Info/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Type of Need/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description of Need/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Urgency/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Request/i })).toBeInTheDocument();
  });

  it('shows an error message if required fields are not filled (rendering test)', async () => {
    jest.spyOn(React, 'useState')
      .mockImplementationOnce((initialState) => [initialState, jest.fn()]) // name
      .mockImplementationOnce((initialState) => [initialState, jest.fn()]) // contactInfo
      .mockImplementationOnce((initialState) => [initialState, jest.fn()]) // location
      .mockImplementationOnce((initialState) => [initialState, jest.fn()]) // typeOfNeed
      .mockImplementationOnce((initialState) => [initialState, jest.fn()]) // description
      .mockImplementationOnce((initialState) => [initialState, jest.fn()]) // urgency
      .mockImplementationOnce((initialState) => [initialState, jest.fn()]) // submissionStatus
      .mockImplementationOnce(() => ['Please fill in all required fields', jest.fn()]) // error
      .mockImplementationOnce((initialState) => [initialState, jest.fn()]); // loading

    render(<NeedHelpPage />);
    expect(screen.getByText(/Please fill in all required fields/i)).toBeInTheDocument();
  });

  it('submits the form successfully', async () => {
    render(<NeedHelpPage />);
    fireEvent.input(screen.getByLabelText(/Contact Info/i), { target: { value: 'test@example.com' } });
    fireEvent.input(screen.getByLabelText(/Your Location/i), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByLabelText(/Type of Need/i), { target: { value: 'food' } });
    fireEvent.change(screen.getByLabelText(/Urgency/i), { target: { value: 'high' } });

    fireEvent.click(screen.getByRole('button', { name: /Submit Request/i }));

    await waitFor(() => {
      expect(screen.getByText(/Help request submitted successfully!/i)).toBeInTheDocument();
    });
  });
});
