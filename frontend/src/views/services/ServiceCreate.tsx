import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { ServiceStore } from '../../stores/serviceStore';
import { RouteComponentProps } from 'react-router';
import { InjectedNotistackProps } from 'notistack';
import ServiceForm from './ServiceForm';
import compose from '../../utilities/compose';
import { Service } from './types';
import { RateGroup, RateGroupStore } from '../../stores/rateGroupStore';
import { computed } from 'mobx';
import { empty } from '../../utilities/helpers';
import { serviceTemplate } from './serviceSchema';
import { FormValues } from '../../types';

export interface Props extends RouteComponentProps, InjectedNotistackProps {
  serviceStore?: ServiceStore;
  rateGroupStore?: RateGroupStore;
}

@compose(
  inject('serviceStore', 'rateGroupStore'),
  observer
)
export default class ServiceCreate extends React.Component<Props> {
  state = {
    submitted: false,
  };

  constructor(props: Props) {
    super(props);
    props.rateGroupStore!.fetchAll();
  }

  public handleSubmit = (service: Service) => {
    return this.props.serviceStore!.post(service).then(() => {
      this.setState({ submitted: true });
      const idOfNewService = this.props!.serviceStore!.service!.id;
      this.props.history.replace('/services/' + idOfNewService);
    });
  };

  @computed
  get serviceRates() {
    return this.props.rateGroupStore!.rateGroups.map((g: RateGroup) => ({
      rate_group_id: g.id,
      rate_unit_id: null,
      value: '',
    }));
  }

  @computed
  get service(): Service {
    // We prepopulate the form with all registered ServiceRates from the backend, to ensure all of them have been
    // connected with this service. This does not handle the case where a new ServiceRate is created later, but
    // we don't intend to create any in the future, so we just ignore that case.
    return {
      ...serviceTemplate,
      service_rates: this.serviceRates as FormValues,
    };
  }

  public render() {
    return (
      <ServiceForm
        title={'Service erstellen'}
        onSubmit={this.handleSubmit}
        service={this.service}
        loading={empty(this.serviceRates)}
        submitted={this.state.submitted}
        rateUnitSelectDisabled={false}
      />
    );
  }
}
