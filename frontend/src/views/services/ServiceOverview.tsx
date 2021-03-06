import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { ActionButtons } from '../../layout/ActionButtons';
import Overview, { Column } from '../../layout/Overview';
import { MainStore } from '../../stores/mainStore';
import { ServiceStore } from '../../stores/serviceStore';
import { Service, ServiceListing } from '../../types';
import compose from '../../utilities/compose';

export type Props = {
  serviceStore?: ServiceStore;
  mainStore?: MainStore;
} & RouteComponentProps;

@compose(
  inject('serviceStore', 'mainStore'),
  observer,
  withRouter,
)
export default class ServiceOverview extends React.Component<Props> {
  columns: Array<Column<ServiceListing>> = [];

  constructor(props: Props) {
    super(props);
    this.columns = [
      {
        id: 'id',
        numeric: true,
        label: 'ID',
        defaultSort: 'desc',
      },
      {
        id: 'order',
        numeric: true,
        label: 'R.',
      },
      {
        id: 'name',
        numeric: false,
        label: 'Name',
        format: s => s.name + (s.archived ? ' [A]' : ''),
      },
      {
        id: 'description',
        numeric: false,
        label: 'Beschreibung',
      },
    ];
  }

  render() {
    const serviceStore = this.props.serviceStore;

    return (
      <Overview
        archivable
        paginated
        searchable
        title={'Services'}
        store={this.props.serviceStore!}
        addAction={'/services/new'}
        columns={this.columns}
        renderActions={e => (
          <ActionButtons
            copyAction={async () => {
              if (e.id) {
                const newEntity: Service = await serviceStore!.duplicate(e.id);
                this.props.history.push(`/services/${newEntity.id}`);
              }
            }}
            archiveAction={(!e.archived && e.id) ? () => serviceStore!.archive(e.id!, true).then(r => serviceStore!.fetchAllPaginated()) : undefined}
            restoreAction={(e.archived && e.id) ? () => serviceStore!.archive(e.id!, false).then(r => serviceStore!.fetchAllPaginated()) : undefined}
          />
        )}
        onClickRow={'/services/:id'}
      />
    );
  }
}
