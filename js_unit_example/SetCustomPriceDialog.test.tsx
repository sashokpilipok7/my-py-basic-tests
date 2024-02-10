import { fireEvent, render, within, waitFor } from '@testing-library/react';
import { withThemeProvider } from 'utils';

import { OrderType, ServiceTypeName } from 'store/types';
import SetCustomPriceDialog, { SetCustomPriceDialogProps } from '.';

const services = Object.values(ServiceTypeName).filter(
  (item) => item !== 'followers'
);

const setup = ({
  pricesList = [],
  open = true,
  onCancel = jest.fn(),
  onConfirm = jest.fn(),
}: Partial<SetCustomPriceDialogProps> = {}) =>
  render(
    withThemeProvider(
      <SetCustomPriceDialog
        pricesList={pricesList}
        open={open}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    )
  );

describe('organisms/SetCustomPriceDialog', () => {
  it('renders component successfully', () => {
    const { getByLabelText } = setup();
    const dialog = getByLabelText(/set-custom-price-dialog/i);
    const cancelButton = getByLabelText(/cancel-button/i);
    const confirmButton = getByLabelText(/confirm-button/i);
    expect(dialog).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
    expect(confirmButton).toBeInTheDocument();
  });

  it('should have subtabs for all OrderTypes', () => {
    const { getByText } = setup();

    expect(getByText(OrderType.AUTO)).toBeInTheDocument();
    expect(getByText(OrderType.MANUAL)).toBeInTheDocument();
    expect(getByText(OrderType.FOLLOWERS)).toBeInTheDocument();
  });

  it('should open and hightlight `Auto` tab by default', () => {
    const { getByText } = setup();
    const currentTab = getByText(OrderType.AUTO).closest('button');
    expect(currentTab).toHaveClass('MuiTab-selected');
  });

  it('should have correct services for `Auto order`', () => {
    const { getAllByText } = setup();
    services.forEach((service) => {
      const serviceLabel = getAllByText(
        new RegExp(`Enter new price for 1000 ${service}`)
      )[0];
      expect(serviceLabel).toBeInTheDocument();
    });
  });

  it('should have correct services for `Manual order`', () => {
    const { getAllByText, getByText } = setup();
    const currentTab = getByText(OrderType.MANUAL);

    fireEvent.click(currentTab);

    expect(currentTab?.closest('button')).toHaveClass('MuiTab-selected');
    services.forEach((service) => {
      const serviceLabel = getAllByText(
        new RegExp(`Enter new price for 1000 ${service}`)
      )[0];
      expect(serviceLabel).toBeInTheDocument();
    });
  });

  it('should have correct services for `Followers order`', () => {
    const { getAllByText, getByText } = setup();
    fireEvent.click(getByText(OrderType.FOLLOWERS));
    const serviceLabel = getAllByText(
      new RegExp(`Enter new price for 1000 followers`)
    )[0];
    expect(serviceLabel).toBeInTheDocument();
  });

  describe('organisms/SetCustomPriceDialog - Dialog work', () => {
    it('should trigger cancelSpy when clicking on close button', () => {
      const onCancelSpy = jest.fn();
      const { getByLabelText } = setup({
        onCancel: onCancelSpy,
      });
      const closeButton = getByLabelText('close');

      fireEvent.click(closeButton);

      expect(onCancelSpy).toHaveBeenCalledTimes(1);
    });

    it('should trigger cancelSpy when clicking on "cancel" button', () => {
      const onCancelSpy = jest.fn();
      const { getByLabelText } = setup({
        onCancel: onCancelSpy,
      });
      const cancelButton = getByLabelText(/cancel-button/i);

      fireEvent.click(cancelButton);

      expect(onCancelSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('organisms/SetCustomPriceDialog - Form logic', () => {
    it('should submit price changes after user interactinos', async () => {
      const { getByLabelText, findByLabelText } = setup();
      const dialog = getByLabelText(/set-custom-price-dialog/i);
      const button = within(dialog).getByRole('button', {
        name: /confirm-button/i,
      });
      const checkbox = within(dialog).getAllByRole('checkbox')[0];
      const input = within(dialog).getAllByLabelText('input')[0];

      expect(button).toBeInTheDocument();
      expect(checkbox).toBeInTheDocument();
      expect(input).toBeInTheDocument();

      fireEvent.click(checkbox);
      fireEvent.change(input, {
        target: { value: 10 },
      });
      fireEvent.click(button);

      const customPriceConfirmDialog = await findByLabelText(
        'set-custom-price-confirm-dialog'
      );
      expect(customPriceConfirmDialog).toBeInTheDocument();

      const confirmDialogButton = within(customPriceConfirmDialog).getByRole(
        'button',
        {
          name: /confirm-button/i,
        }
      );
      fireEvent.click(confirmDialogButton);
      await waitFor(() =>
        expect(customPriceConfirmDialog).not.toBeInTheDocument()
      );
    });
  });
});
