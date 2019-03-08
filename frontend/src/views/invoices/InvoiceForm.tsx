import * as React from 'react';
import { Fragment } from 'react';
import { FormikProps } from 'formik';
import { TextField } from '../../form/fields/common';
import Grid from '@material-ui/core/Grid/Grid';
import { empty } from '../../utilities/helpers';
import { inject, observer } from 'mobx-react';
import { FormView, FormViewProps } from '../../form/FormView';
import compose from '../../utilities/compose';
import { Invoice } from '../../types';
import { EmployeeSelect } from '../../form/entitySelect/EmployeeSelect';
import { AddressSelect } from '../../form/entitySelect/AddressSelect';
import { MarkdownField } from '../../form/fields/MarkdownField';
import CurrencyField from '../../form/fields/CurrencyField';
import { InvoiceStore } from '../../stores/invoiceStore';
import { FormHeader } from '../../layout/FormHeader';
import PrintButton from '../../layout/PrintButton';
import { DatePicker } from '../../form/fields/DatePicker';
import InvoicePositionSubformInline from './InvoicePositionSubformInline';
import InvoiceDiscountSubform from './InvoiceDiscountSubform';
import InvoiceCostgroupSubform from './InvoiceCostgroupSubform';
import { BreakdownTable } from '../../layout/BreakdownTable';
import Navigator from './InvoiceNavigator';
import { ESRIcon, InvoiceIcon, StatisticsIcon } from '../../layout/icons';
import { invoiceSchema } from './invoiceSchema';
import { CustomerSelect } from '../../form/entitySelect/CustomerSelect';
import { DimePaper } from '../../layout/DimePaper';
import { CustomerStore } from '../../stores/customerStore';
import { EmployeeStore } from '../../stores/employeeStore';
import { RateUnitStore } from '../../stores/rateUnitStore';
import { CostgroupStore } from '../../stores/costgroupStore';
import { DimeField } from '../../form/fields/formik';
import PercentageField from '../../form/fields/PercentageField';

export interface Props extends FormViewProps<Invoice> {
  costgroupStore?: CostgroupStore;
  customerStore?: CustomerStore;
  employeeStore?: EmployeeStore;
  invoiceStore?: InvoiceStore;
  invoice: Invoice;
  rateUnitStore?: RateUnitStore;
}

@compose(
  inject('costgroupStore', 'customerStore', 'employeeStore', 'invoiceStore', 'rateUnitStore'),
  observer
)
export default class InvoiceForm extends React.Component<Props> {
  public state = {
    loading: true,
  };

  componentWillMount() {
    Promise.all([
      this.props.costgroupStore!.fetchAll(),
      this.props.customerStore!.fetchAll(),
      this.props.employeeStore!.fetchAll(),
      this.props.rateUnitStore!.fetchAll(),
    ]).then(() => this.setState({ loading: false }));
  }

  public render() {
    const { invoice } = this.props;

    return (
      <FormView
        paper={false}
        loading={empty(invoice) || this.props.loading}
        title={this.props.title}
        validationSchema={invoiceSchema}
        initialValues={invoice}
        onSubmit={this.props.onSubmit}
        submitted={this.props.submitted}
        appBarButtons={
          invoice && invoice.id ? (
            <>
              <PrintButton
                path={`invoices/${invoice.id}/print_effort_report`}
                color={'inherit'}
                title={
                  invoice.project_id
                    ? 'Aufwandsrapport drucken'
                    : 'Da die Rechnung kein verlinktes Projekt hat, kann kein Aufwandrapport erzeugt werden.'
                }
                icon={StatisticsIcon}
                disabled={!invoice.project_id}
              />
              <PrintButton path={`invoices/${invoice.id}/print_esr`} color={'inherit'} title={'Einzahlungsschein drucken'} icon={ESRIcon} />
              <PrintButton path={`invoices/${invoice.id}/print`} color={'inherit'} title={'Rechnung drucken'} icon={InvoiceIcon} />
            </>
          ) : (
            undefined
          )
        }
        render={(props: FormikProps<Invoice>) => {
          return (
            <Fragment>
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={24}>
                  <Grid item xs={12}>
                    {invoice.id && <Navigator invoice={invoice} />}
                    <DimePaper>
                      <Grid container spacing={8}>
                        <Grid item xs={12} lg={8}>
                          <Grid container spacing={8}>
                            <Grid item xs={12}>
                              <DimeField delayed required component={TextField} name={'name'} label={'Name'} />
                            </Grid>
                            <Grid item xs={12} lg={6}>
                              <DimeField required component={CustomerSelect} name={'customer_id'} label={'Kunde'} />
                            </Grid>
                            <Grid item xs={12} lg={6}>
                              <DimeField
                                required
                                component={AddressSelect}
                                customerId={props.values.customer_id}
                                name={'address_id'}
                                label={'Adresse'}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <DimeField
                                required
                                component={EmployeeSelect}
                                name={'accountant_id'}
                                label={'Verantwortlicher Mitarbeiter'}
                              />
                            </Grid>
                            <Grid item xs={12} lg={6}>
                              <DimeField required component={DatePicker} name={'start'} label={'Startdatum'} />
                            </Grid>
                            <Grid item xs={12} lg={6}>
                              <DimeField required component={DatePicker} name={'end'} label={'Enddatum'} />
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <DimeField
                            delayed
                            required
                            component={MarkdownField}
                            multiline
                            rowsMax={14}
                            name={'description'}
                            label={'Beschreibung'}
                          />
                        </Grid>
                      </Grid>
                    </DimePaper>
                  </Grid>

                  <Grid item xs={12}>
                    <DimePaper>
                      <InvoicePositionSubformInline formikProps={props} name={'positions'} />
                    </DimePaper>
                  </Grid>

                  <Grid item xs={12} lg={6}>
                    <DimePaper>
                      <InvoiceCostgroupSubform formikProps={props} name={'costgroup_distributions'} />
                    </DimePaper>
                  </Grid>

                  <Grid item xs={12} lg={6}>
                    <DimePaper>
                      <InvoiceDiscountSubform formikProps={props} name={'discounts'} />
                    </DimePaper>
                  </Grid>
                  {invoice.id && (
                    <Grid item xs={12} lg={4}>
                      <DimePaper>
                        <Grid container spacing={8}>
                          <Grid item xs={12}>
                            <FormHeader>Berechnung</FormHeader>
                          </Grid>
                          <Grid item xs={12}>
                            <BreakdownTable breakdown={invoice.breakdown} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <DimeField
                              fullWidth={false}
                              delayed
                              component={CurrencyField}
                              name={'fixed_price'}
                              label={'Fixpreis'}
                              margin={'normal'}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <DimeField
                              fullWidth={false}
                              delayed
                              component={PercentageField}
                              name={'fixed_price_vat'}
                              label={'Fixpreis MwSt.'}
                            />
                          </Grid>
                        </Grid>
                      </DimePaper>
                    </Grid>
                  )}
                </Grid>
              </form>
            </Fragment>
          );
        }}
      />
    );
  }
}
