import React from 'react';
import { ProjectComment, ProjectEffortListing, ProjectListing, ProjectLocationTracker } from '../../types';
import { TimetrackExpansionPanel } from './TimetrackExpansionPanel';
import { SafeClickableTableRow } from '../../utilities/SafeClickableTableRow';
import { ProjectCommentStore } from '../../stores/projectCommentStore';
import compose from '../../utilities/compose';
import { inject, observer } from 'mobx-react';
import { AddCommentIcon, AddEffortIcon } from '../../layout/icons';
import { ActionButton } from '../../layout/ActionButton';
import { DeleteButton } from '../../layout/ConfirmationDialog';
import { EffortStore } from '../../stores/effortStore';
import createStyles from '@material-ui/core/styles/createStyles';
import Table from '@material-ui/core/Table/Table';
import TableHead from '@material-ui/core/TableHead/TableHead';
import TableRow from '@material-ui/core/TableRow/TableRow';
import TableBody from '@material-ui/core/TableBody/TableBody';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { TimetrackFilterStore } from '../../stores/timetrackFilterStore';
import { Formatter } from '../../utilities/formatter';
import { DimeTableCell } from '../../layout/DimeTableCell';
import moment from 'moment';
import PrintButton from '../../layout/PrintButton';
import { ProjectLocationTrackerStore } from '../../stores/projectLocationTrackerStore';

const styles = createStyles({
  hideActions: {
    '@media (hover)': {
      '& .actions': {
        visibility: 'hidden',
      },
      '&:hover .actions': {
        visibility: 'visible',
      },
    },
  },
});

interface Props extends WithStyles<typeof styles> {
  displayTotal: string;
  efforts: ProjectEffortListing[];
  entity: ProjectListing;
  onEffortAdd: () => void;
  onClickEffortRow: (entity: ProjectEffortListing) => void;
  projectCommentStore?: ProjectCommentStore;
  projectLocationTrackerStore?: ProjectLocationTrackerStore;
  effortStore?: EffortStore;
  timetrackFilterStore?: TimetrackFilterStore;
  formatter?: Formatter;
  effortReportUrlParams: () => object;
}

type CombinedTableType = ProjectEffortListing | ProjectComment | ProjectLocationTracker;

@compose(
  inject('projectCommentStore', 'effortStore', 'timetrackFilterStore', 'formatter', 'projectLocationTrackerStore'),
  observer
)
class TimetrackProjectCombinedTableInner extends React.Component<Props> {
  public handleClickCommentRow = async (entity: ProjectComment | undefined) => {
    if (entity && entity.id) {
      await this.props.projectCommentStore!.fetchOne(entity.id);
      this.props.projectCommentStore!.editing = true;
    }
  };

  public handleClickTimeTrackerRow = async (entity: ProjectLocationTracker | undefined) => {
    if (entity && entity.id) {
      await this.props.projectLocationTrackerStore!.fetchOne(entity.id);
      this.props.projectLocationTrackerStore!.editing = true;
    }
  };

  public handleProjectCommentAdd = () => {
    this.props.projectCommentStore!.projectCommentTemplate!.project_id = this.props.entity.id;
    this.props.projectCommentStore!.editing = true;
  };

  public handleEffortDelete = async (id: number) => {
    await this.props.effortStore!.delete(id);
    await this.props.effortStore!.fetchFiltered(this.props.timetrackFilterStore!.filter);
  };

  public handleCommentDelete = async (id: number) => {
    await this.props.projectCommentStore!.delete(id);
    await this.props.projectCommentStore!.fetchFiltered(this.props.timetrackFilterStore!.filter);
  };

  public projectGroupActions = (
    <>
      <PrintButton
        path={'projects/' + this.props.entity.id + '/print_effort_report'}
        title={'Aufwandsrapport drucken'}
        urlParams={this.props.effortReportUrlParams()}
      />
      <ActionButton icon={AddCommentIcon} action={this.handleProjectCommentAdd} title={'Kommentar hinzufügen'} />
      <ActionButton icon={AddEffortIcon} action={this.props.onEffortAdd} title={'Aufwand hinzufügen'} />
    </>
  );

  public render() {
    const { displayTotal, efforts, entity, onClickEffortRow, projectCommentStore, projectLocationTrackerStore, classes } = this.props;
    const comments = projectCommentStore!.projectComments.filter((comment: ProjectComment) => comment.project_id === entity.id);
    const locationTrackers = projectLocationTrackerStore!.projectLocationTrackers
      .filter((locationTracker: ProjectLocationTracker) => locationTracker.project_id === entity.id)
      .filter((projectLocationTracker: ProjectLocationTracker) => projectLocationTracker.project_id === entity.id);
    const formatter = this.props.formatter!;

    let joinedForces: CombinedTableType[] = efforts;
    joinedForces = joinedForces.concat(comments);
    joinedForces = joinedForces.concat(locationTrackers);
    joinedForces = joinedForces.sort((a, b) => {
      const dateA = moment(a.date);
      const dateB = moment(b.date);
      return dateB.valueOf() - dateA.valueOf();
    });

    if (efforts.length > 0 || comments.length > 0) {
      return (
        <TimetrackExpansionPanel actions={this.projectGroupActions} title={entity.name} displayTotal={displayTotal}>
          <Table>
            <TableHead>
              <TableRow>
                <DimeTableCell>Datum</DimeTableCell>
                <DimeTableCell>Mitarbeiter</DimeTableCell>
                <DimeTableCell>Aktivität</DimeTableCell>
                <DimeTableCell numeric>Gebuchter Wert</DimeTableCell>
                <DimeTableCell numeric />
              </TableRow>
            </TableHead>
            <TableBody>
              {joinedForces.map((e: CombinedTableType) => {
                if ('comment' in e) {
                  const comment = e as ProjectComment;
                  return (
                    <TableRow
                      hover
                      className={classes.hideActions}
                      key={`comment_${comment.id}`}
                      onClick={() => this.handleClickCommentRow(comment)}
                      component={SafeClickableTableRow}
                    >
                      <DimeTableCell style={{ fontStyle: 'italic' }}>{formatter.formatDate(comment.date)}</DimeTableCell>
                      <DimeTableCell colSpan={3} style={{ fontStyle: 'italic' }}>
                        {comment.comment}
                      </DimeTableCell>
                      <DimeTableCell numeric>
                        <span className={'actions'}>
                          <DeleteButton onConfirm={() => this.handleCommentDelete(comment.id!)} />
                        </span>
                      </DimeTableCell>
                    </TableRow>
                  );
                } else if ('project_location' in e) {
                  const timeTrack = e as ProjectLocationTracker;
                  return (
                    <TableRow
                      hover
                      className={classes.hideActions}
                      key={`time_tracker_${timeTrack.id}`}
                      onClick={() => this.handleClickTimeTrackerRow(timeTrack)}
                      component={SafeClickableTableRow}
                    >
                      <DimeTableCell style={{ fontStyle: 'italic' }}>{formatter.formatDate(timeTrack.date)}</DimeTableCell>
                      <DimeTableCell colSpan={1} style={{ fontStyle: 'italic' }}>
                        {timeTrack.project_location!.name}
                      </DimeTableCell>
                      <DimeTableCell colSpan={2} style={{ fontStyle: 'italic' }}>
                        {timeTrack.project_work_type!.name}
                      </DimeTableCell>
                      <DimeTableCell numeric>
                        <span className={'actions'}>
                          <DeleteButton onConfirm={() => this.handleCommentDelete(timeTrack.id!)} />
                        </span>
                      </DimeTableCell>
                    </TableRow>
                  );
                } else {
                  const effort = e as ProjectEffortListing;
                  return (
                    <TableRow
                      hover
                      className={classes.hideActions}
                      key={`effort_${effort.id}`}
                      onClick={() => onClickEffortRow(effort)}
                      component={SafeClickableTableRow}
                    >
                      <DimeTableCell>{formatter.formatDate(effort.date)}</DimeTableCell>
                      <DimeTableCell>{effort.employee_full_name!}</DimeTableCell>
                      <DimeTableCell>
                        {effort.position_description!
                          ? effort.service_name! + ' (' + effort.position_description! + ')'
                          : effort.service_name!}
                      </DimeTableCell>
                      <DimeTableCell numeric>
                        {formatter.formatRateEntry(effort.effort_value!, effort.rate_unit_factor!, effort.effort_unit!)}
                      </DimeTableCell>
                      <DimeTableCell numeric>
                        <span className={'actions'}>
                          <DeleteButton onConfirm={() => this.handleEffortDelete(effort.id!)} />
                        </span>
                      </DimeTableCell>
                    </TableRow>
                  );
                }
              })}
            </TableBody>
          </Table>
        </TimetrackExpansionPanel>
      );
    } else {
      return (
        <TimetrackExpansionPanel actions={this.projectGroupActions} title={entity.name}>
          Keine Leistungen erfasst mit den gewählten Filtern.
        </TimetrackExpansionPanel>
      );
    }
  }
}
export const TimetrackProjectCombinedTable = withStyles(styles)(TimetrackProjectCombinedTableInner);
