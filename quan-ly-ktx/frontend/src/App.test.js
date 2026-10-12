import { render, screen } from '@testing-library/react';
import App from './App';

afterEach(() => {
  window.history.replaceState({}, '', '/');
});

test('shows the overview and navigation to each management area', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /chào mừng đến với ktx care/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Phòng ở', exact: true })).toHaveAttribute('href', '#rooms');
  expect(screen.getByRole('link', { name: 'Sinh viên', exact: true })).toHaveAttribute('href', '#students');
  expect(screen.getByRole('link', { name: 'Hợp đồng', exact: true })).toHaveAttribute('href', '#contracts');
  expect(screen.getByRole('link', { name: 'Hóa đơn điện nước', exact: true })).toHaveAttribute('href', '#utility-bills');
});

test('opens a management area when its navigation hash changes', async () => {
  render(<App />);

  window.location.hash = '#rooms';

  expect(await screen.findByRole('heading', { name: 'Phòng ở' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /trở về tổng quan/i })).toHaveAttribute('href', '#overview');
});

test('opens the selected area when its URL hash is loaded directly', () => {
  window.history.replaceState({}, '', '/#students');

  render(<App />);

  expect(screen.getByRole('heading', { name: 'Sinh viên' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Sinh viên', exact: true })).toHaveAttribute('aria-current', 'page');
});
