import React, { useCallback, useMemo, useState } from 'react';
import debounce from 'lodash.debounce';
import { FormikProps, useFormik } from 'formik';
import * as yup from 'yup';
import styled from 'styled-components';
import {
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  Button,
  IconButton,
  Typography,
  Paper,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

import { DebounceTimeList } from 'customHooks';
import { filterObjectProps } from 'helpers';
import {
  ServiceTypeName,
  OrderType,
  UpdateUserPriceData,
  PriceItem,
} from 'store/types';
import { TabPanel, ServiceItemCard } from 'components/molecules';
import ConfirmationDialog from 'components/organisms/ConfirmationDialog';

// data
const services = Object.values(ServiceTypeName);
const mainServices = services.filter(
  (item) => item !== ServiceTypeName.FOLLOWERS
);

// tabs
type TabsLabelsType = {
  tabName: string;
  value: number;
};
const tabLabels: TabsLabelsType[] = [
  OrderType.AUTO,
  OrderType.MANUAL,
  OrderType.FOLLOWERS,
].map((i, idx) => ({
  tabName: i,
  value: idx,
}));
const serviceNamesIdx: OrderType[] = [
  OrderType.AUTO,
  OrderType.MANUAL,
  OrderType.MANUAL,
];
const [{ value: defaultTabValue }] = tabLabels;

// form
type ValuesType = { [key in ServiceTypeName]: number };
const initialValues: ValuesType = services.reduce(
  (acc, item) => ({ ...acc, [item]: '' }),
  {} as ValuesType
);
const validationSchema = yup.object(
  services.reduce(
    (acc, item) => ({
      ...acc,
      [item]: yup
        .number()
        .test(
          'positive',
          'must be a positive number',
          (n: number = 0) => n >= 0
        )
        .test(
          'maxDigits',
          'number field must have 2 digits or less',
          (n: number = 0) => {
            const decPart = `${n}`.split('.')[1];

            return decPart ? String(decPart).length <= 2 : true;
          }
        ),
    }),
    {}
  )
);

export type SetCustomPriceDialogProps = {
  pricesList: PriceItem[];
  open: boolean;
  onCancel: () => void;
  onConfirm: (data: UpdateUserPriceData) => void;
};

export const SetCustomPriceDialog: React.FC<SetCustomPriceDialogProps> = ({
  pricesList,
  open,
  onConfirm,
  onCancel,
}) => {
  const [tabValue, setTabValue] = useState(defaultTabValue);
  const onTabChange = (e: React.ChangeEvent<{}>, newValue: number) => {
    resetForm();
    setTabValue(newValue);
  };

  const [dataForSending, setDataForSending] = useState<UpdateUserPriceData>(
    {} as UpdateUserPriceData
  );
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const onConfirmDialogCancel = () => {
    setConfirmModalOpen(false);
    setDataForSending({} as UpdateUserPriceData);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onConfirmDialogConfirm = useCallback(
    debounce(() => {
      setConfirmModalOpen(false);
      onConfirm(dataForSending);
      resetForm();
    }, DebounceTimeList.DCLICK),
    [dataForSending]
  );

  const onMainDialogCancel = () => {
    onCancel();
    resetForm();
    setTabValue(defaultTabValue);
  };

  const serviceNameByTab = useMemo(() => serviceNamesIdx[tabValue], [tabValue]);
  const formattedPriceList: { [key: string]: number } = useMemo(() => {
    const mainPrices = pricesList
      .filter((item) => item.charge_interval !== 'm')
      .reduce(
        (acc, item) => ({
          ...acc,
          [`${item.service}-${item.type_name}`]: item.price,
        }),
        {}
      );

    return mainPrices;
  }, [pricesList]);

  const onSubmit = (data: ValuesType) => {
    setDataForSending({
      service: serviceNameByTab,
      prices: filterObjectProps<ValuesType>(
        data,
        (val: number | string) => val !== '' && val >= 0
      ),
    });
    setConfirmModalOpen(true);
  };

  const {
    values,
    errors,
    touched,
    dirty,
    handleChange,
    handleSubmit,
    setFieldValue,
    resetForm,
  }: FormikProps<ValuesType> = useFormik<ValuesType>({
    initialValues,
    validationSchema,
    onSubmit,
  });

  const renderServices = (data: ServiceTypeName[]) => {
    const list = data.map((i) => (
      <ServiceItemCard
        key={i}
        typeName={i}
        value={values[i]}
        title={`, current price: ${
          formattedPriceList[`${serviceNameByTab}-${i}`] || 0
        } `}
        label={`Enter new price for 1000 ${i}`}
        error={errors[i]}
        touched={touched[i]}
        handleChange={handleChange}
        setFieldValue={setFieldValue}
      >
        {i}
      </ServiceItemCard>
    ));

    return <StyledPaper elevation={2}>{list}</StyledPaper>;
  };

  return (
    <>
      <StyledDialog
        aria-label="set-custom-price-dialog"
        open={open}
        onClose={onMainDialogCancel}
        maxWidth="md"
      >
        <StyledIconButton aria-label="close" onClick={onMainDialogCancel}>
          <CloseIcon />
        </StyledIconButton>
        <Wrapper>
          <StyledTabs
            value={tabValue}
            onChange={onTabChange}
            indicatorColor="primary"
            textColor="primary"
            aria-label="tabs-wrapper"
          >
            {tabLabels.map(({ tabName, value }) => (
              <Tab
                key={`${tabName.split(' ').join('-')}-${value}`}
                label={tabName}
              />
            ))}
          </StyledTabs>
          <form onSubmit={handleSubmit}>
            <TabPanel key="automatic-tab" value={tabValue} index={0}>
              {renderServices(mainServices)}
            </TabPanel>
            <TabPanel key="manual-tab" value={tabValue} index={1}>
              {renderServices(mainServices)}
            </TabPanel>
            <TabPanel key="followers-tab" value={tabValue} index={2}>
              {renderServices([ServiceTypeName.FOLLOWERS])}
            </TabPanel>
            <StyledButtonGroup>
              <StyledButton
                aria-label="cancel-button"
                color="primary"
                variant="outlined"
                onClick={onMainDialogCancel}
              >
                Cancel
              </StyledButton>
              <StyledButton
                aria-label="confirm-button"
                color="primary"
                variant="contained"
                type="submit"
                disabled={!dirty}
              >
                Save
              </StyledButton>
            </StyledButtonGroup>
          </form>
        </Wrapper>
      </StyledDialog>
      <ConfirmationDialog
        open={confirmModalOpen}
        onCancel={onConfirmDialogCancel}
        onConfirm={onConfirmDialogConfirm}
        dialogTitle="Set custom Price"
        cancelCaption="Cancel"
        confirmCaption="Save"
        label="set-custom-price-confirm-dialog"
      >
        <Typography>Are you sure you want to change price ?</Typography>
      </ConfirmationDialog>
    </>
  );
};

const StyledDialog = styled(Dialog)`
  margin: 0;
  padding: ${({ theme }) => theme.muiTheme.spacing(2)}px;
`;

const StyledIconButton = styled(IconButton)`
  position: absolute;
  right: ${({ theme }) => theme.muiTheme.spacing(1)}px;
  top: ${({ theme }) => theme.muiTheme.spacing(1)}px;
  color: ${({ theme }) => theme.muiTheme.palette.grey[500]};
`;

const Wrapper = styled(DialogContent)`
  min-width: 600px;
  display: grid;
  grid-gap: 1.5rem;
  margin: 0 auto;
  padding: 1.5rem 2rem;
`;

const StyledTabs = styled(Tabs)`
  &.MuiTab-root {
    justify-content: center;
  }
`;

const StyledPaper = styled(Paper)`
  padding: 1.5rem;
`;

const StyledButtonGroup = styled.div`
  width: 100%;
  display: inline-flex;
  justify-content: space-evenly;
  margin-top: 1.5rem;
`;

const StyledButton = styled(Button)`
  width: max(25%, 150px);
`;
