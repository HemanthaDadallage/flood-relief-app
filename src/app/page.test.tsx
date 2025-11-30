import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home page', () => {
  it('renders the main heading', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', {
      name: /Flood Relief Sri Lanka/i,
    });
    expect(heading).toBeInTheDocument();
  });
});
