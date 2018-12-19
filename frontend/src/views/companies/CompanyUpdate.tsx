import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { CompanyStore } from '../../stores/companyStore';
import { RouteComponentProps } from 'react-router';
import compose from '../../utilities/compose';
import { toJS } from 'mobx';
import { Address, Company } from 'src/types';
import CompanyForm from './CompanyForm';

interface PersonDetailRouterProps {
  id?: string;
}

export interface Props extends RouteComponentProps<PersonDetailRouterProps> {
  companyStore?: CompanyStore;
}

@compose(
  inject('companyStore'),
  observer
)
export default class CompanyUpdate extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    props.companyStore!.fetchOne(Number(props.match.params.id));
  }

  public handleSubmit = (company: Company) => {
    return this.props.companyStore!.put(company);
  };

  public get company() {
    const company = this.props.companyStore!.company;
    if (company) {
      return {
        //it's important to detach the mobx proxy before passing it into formik - formik's deepClone can fall into endless recursions with those proxies.
        ...toJS(company),
        addresses: (company.addresses ? company.addresses : []).map((e: Address) => ({
          ...e,
          supplement: e.supplement || '',
        })),
      };
    } else {
      return undefined;
    }
  }

  public render() {
    const company = this.company;
    const title = company ? `${company.name} - Firma` : 'Kunde bearbeiten';

    return <CompanyForm title={title} onSubmit={this.handleSubmit} company={company!} />;
  }
}
