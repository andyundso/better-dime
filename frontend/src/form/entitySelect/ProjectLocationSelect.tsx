import * as React from 'react';
import { inject, observer } from 'mobx-react';
import compose from '../../utilities/compose';
import Select, { DimeSelectFieldProps } from '../fields/Select';
import { ProjectLocationStore } from '../../stores/projectLocationStore';

interface Props<T = number> extends DimeSelectFieldProps<T> {
  projectLocationStore?: ProjectLocationStore;
}

@compose(
  inject('projectLocationStore'),
  observer
)
export class ProjectLocationSelect<T> extends React.Component<Props<T>> {
  constructor(props: Props<T>) {
    super(props);
    this.props.projectLocationStore!.fetchAll();
  }

  public get options() {
    return this.props.projectLocationStore!.projectLocations.map(e => ({
      value: e.id,
      label: `${e.id} ${e.name}`,
    }));
  }

  public render() {
    return <Select options={this.options} {...this.props} />;
  }
}
