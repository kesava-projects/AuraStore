import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RatingStars } from '../components/common/RatingStars.jsx';

describe('RatingStars Component', () => {
  it('renders rating number and review count properly', () => {
    render(<RatingStars rating={4.5} count={88} />);
    expect(screen.getByText(/4.5/)).toBeInTheDocument();
    expect(screen.getByText(/\(88\)/)).toBeInTheDocument();
  });
});
