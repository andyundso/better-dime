import React from 'react';
import { MainStore } from '../../stores/mainStore';
import { ProjectLocationTrackerStore } from '../../stores/projectLocationTrackerStore';
import compose from '../../utilities/compose';
import { inject, observer } from 'mobx-react';
import * as yup from 'yup';
import { FormDialog } from '../../form/FormDialog';
import { ProjectLocationTracker } from '../../types';
import { ProjectSelect } from '../../form/entitySelect/ProjectSelect';
import { DatePicker } from '../../form/fields/DatePicker';
import { TimetrackFilterStore } from '../../stores/timetrackFilterStore';
import { dimeDate, localizeSchema, selector } from '../../utilities/validation';
import moment from 'moment';
import { DimeField } from '../../form/fields/formik';
import { ProjectLocationSelect } from '../../form/entitySelect/ProjectLocationSelect';
import { ProjectWorkTypeSelect } from '../../form/entitySelect/ProjectWorkTypeSelect';

interface Props {
  onClose: () => void;
  projectLocationTrackerStore?: ProjectLocationTrackerStore;
  mainStore?: MainStore;
  timetrackFilterStore?: TimetrackFilterStore;
}

const schema = localizeSchema(() =>
  yup.object({
    date: dimeDate(),
    project_id: selector(),
    project_location_id: selector(),
    project_work_type_id: selector(),
  })
);

@compose(
  inject('projectLocationTrackerStore', 'timetrackFilterStore', 'mainStore'),
  observer
)
export class TimetrackProjectLocationTrackerForm extends React.Component<Props> {
  public handleSubmit = async (entity: ProjectLocationTracker) => {
    const projectLocationTrackerStore = this.props.projectLocationTrackerStore!;
    if (projectLocationTrackerStore.entity) {
      await projectLocationTrackerStore.put(schema.cast(entity));
    } else {
      await projectLocationTrackerStore.post(schema.cast(entity));
      await this.widenFilterSettings(entity);
    }
    await projectLocationTrackerStore.fetchFiltered(this.props.timetrackFilterStore!.filter);
    projectLocationTrackerStore.editing = false;
  };

  //widen the filter so the newly added entities are displayed
  private widenFilterSettings = async (entity: ProjectLocationTracker) => {
    const filter = this.props.timetrackFilterStore!.filter;

    this.props.timetrackFilterStore!.grouping = 'project';

    if (filter.projectIds.length > 0) {
      const allIds = new Set(filter.projectIds);
      allIds.add(entity.project_id!);
      filter.projectIds = Array.from(allIds.values());
    }

    const trackerDate = moment(entity.date);
    const filterEnd = moment(filter.end);
    const filterStart = moment(filter.start);

    if (trackerDate.isAfter(filterEnd)) {
      filter.end = trackerDate.clone();
    }

    if (trackerDate.isBefore(filterStart)) {
      filter.start = trackerDate.clone();
    }
  };

  public render() {
    return (
      <FormDialog
        open
        onClose={this.props.onClose}
        title={'Projekt-Kommentar erfassen'}
        initialValues={
          this.props.projectLocationTrackerStore!.projectLocationTracker ||
          this.props.projectLocationTrackerStore!.projectLocationTrackerTemplate!
        }
        validationSchema={schema}
        onSubmit={this.handleSubmit}
        render={() => (
          <>
            <DimeField component={DatePicker} name={'date'} label={'Datum'} />
            <DimeField component={ProjectSelect} name={'project_id'} label={'Projekt'} />
            <DimeField component={ProjectLocationSelect} name={'project_location_id'} label={'Projekt Gebiet'} />
            <DimeField component={ProjectWorkTypeSelect} name={'project_work_type_id'} label={'Projekt Arbeit'} />
          </>
        )}
      />
    );
  }
}
