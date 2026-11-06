import { fireEvent, render, screen } from '@testing-library/react';
import BillForm from './BillForm';

test('submits meter readings without a client-supplied total amount', () => {
  const onSave = jest.fn();
  const { container } = render(
    <BillForm
      value={{ month: 11, year: 2026 }}
      onSave={onSave}
      onCancel={jest.fn()}
    />,
  );

  fireEvent.change(screen.getByLabelText('Hạn thanh toán'), {
    target: { value: '2026-12-10' },
  });
  fireEvent.change(screen.getByLabelText('Điện cũ (kWh)'), {
    target: { value: '100' },
  });
  fireEvent.change(screen.getByLabelText('Điện mới (kWh)'), {
    target: { value: '150' },
  });
  fireEvent.change(screen.getByLabelText('Nước cũ (m³)'), {
    target: { value: '10' },
  });
  fireEvent.change(screen.getByLabelText('Nước mới (m³)'), {
    target: { value: '12' },
  });
  fireEvent.submit(container.querySelector('form'));

  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
    month: 11,
    year: 2026,
    old_electric_index: 100,
    new_electric_index: 150,
    old_water_index: 10,
    new_water_index: 12,
  }));
  expect(onSave.mock.calls[0][0]).not.toHaveProperty('total_amount');
});
