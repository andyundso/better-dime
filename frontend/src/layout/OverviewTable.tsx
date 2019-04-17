import Checkbox from '@material-ui/core/Checkbox/Checkbox';
import createStyles from '@material-ui/core/styles/createStyles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import Table from '@material-ui/core/Table/Table';
import TableBody from '@material-ui/core/TableBody/TableBody';
import TableHead from '@material-ui/core/TableHead/TableHead';
import TableRow from '@material-ui/core/TableRow/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel/TableSortLabel';
import { observer } from 'mobx-react';
import * as React from 'react';
import compose from '../utilities/compose';
import { SafeClickableTableRow } from '../utilities/SafeClickableTableRow';
import { DimeTableCell } from './DimeTableCell';
import { Column } from './Overview';

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

// tslint:disable:no-any ; this is adapted from the docs. It should be typed eventually.

function desc(a: any, b: any, orderBy: string): number {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort<T>(array: T[], cmp: any): T[] {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a: any, b: any) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]) as any;
}

function getSorting(order: Direction | undefined, orderBy: string) {
  return order === 'desc' ? (a: any, b: any) => desc(a, b, orderBy) : (a: any, b: any) => -desc(a, b, orderBy);
}

function format<T>(def: Column<T>, row: T): React.ReactNode {
  if (def.format) {
    return def.format(row);
  } else {
    return row[def.id];
  }
}

// tslint:enable:no-any

interface TableProps<T> extends WithStyles<typeof styles> {
  columns: Array<Column<T>>;
  renderActions?: (e: T) => React.ReactNode;
  data: T[];
  onClickRow?: (e: T, index: number) => void;
  noSort?: boolean;
  selected?: number[];
  setSelected?: (e: T, state: boolean) => void;
}

interface TableState {
  orderBy: string;
  order: Direction | undefined;
}

type Direction = 'asc' | 'desc';

@compose(observer)
class OverviewTableInner<T extends { id?: number }> extends React.Component<TableProps<T>, TableState> {
  constructor(props: TableProps<T>) {
    super(props);
    const defaultSortColumn = props.columns.find(c => Boolean(c.defaultSort));
    if (defaultSortColumn) {
      this.state = {
        order: defaultSortColumn.defaultSort,
        orderBy: defaultSortColumn.id,
      };
    } else {
      this.state = {
        order: 'desc',
        orderBy: 'id',
      };
    }
  }

  handleRequestSort = (event: React.MouseEvent<HTMLElement>, property: string) => {
    const orderBy = property;
    let order: Direction = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
  }

  createSortHandler = (property: string) => (event: React.MouseEvent<HTMLElement>) => {
    this.handleRequestSort(event, property);
  }

  handleRowClick = (row: T, index: number) => (e: React.MouseEvent<HTMLElement>) => {
    if (this.props.onClickRow) {
      this.props.onClickRow(row, index);
    }
  }

  get selectAllState() {
    const selected = this.props.selected;
    if (selected) {
      if (selected.length === 0) {
        return { checked: false };
      } else if (selected.length === this.props.data.length) {
        return { checked: true };
      } else {
        return { checked: false, indeterminate: true };
      }
    }
    return {};
  }

  handleSelectAll = () => {
    const selected = this.props.selected!;
    if (selected.length === 0) {
      this.props.data.forEach(e => this.props.setSelected!(e, true));
    } else {
      this.props.data.forEach(e => this.props.setSelected!(e, false));
    }
  }

  RowCheckbox = ({ row }: { row: T }) => {
    const checked = this.props.selected!.includes(row.id!);
    return <Checkbox checked={checked} onClick={() => this.props.setSelected!(row, !checked)} />;
  }

  render() {
    const { columns, data, noSort, classes } = this.props;
    const { order, orderBy } = this.state;
    const sortedData = noSort ? data : stableSort(data, getSorting(order, orderBy));
    const RowCheckbox = this.RowCheckbox;

    return (
      <Table>
        <TableHead>
          <TableRow>
            {this.props.selected && (
              <DimeTableCell padding={'checkbox'}>
                <Checkbox {...this.selectAllState} onClick={this.handleSelectAll} />
              </DimeTableCell>
            )}
            {columns.map(col => (
              <DimeTableCell key={col.id} numeric={col.numeric} sortDirection={orderBy === col.id ? order : undefined}>
                <TableSortLabel active={orderBy === col.id} direction={order} onClick={this.createSortHandler(col.id)}>
                  {col.label}
                </TableSortLabel>
              </DimeTableCell>
            ))}
            {this.props.renderActions && <DimeTableCell numeric />}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((row, index) => (
            <TableRow
              className={classes.hideActions}
              hover
              key={index}
              onClick={this.handleRowClick(row, index)}
              component={SafeClickableTableRow}
            >
              {this.props.selected && (
                <DimeTableCell padding={'checkbox'}>
                  <RowCheckbox row={row} />
                </DimeTableCell>
              )}
              {columns.map(col => (
                <DimeTableCell key={col.id} numeric={col.numeric}>
                  {format(col, row)}
                </DimeTableCell>
              ))}
              {this.props.renderActions && (
                <DimeTableCell numeric>
                  <span className={'actions'}>{this.props.renderActions(row)}</span>
                </DimeTableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
}

export const OverviewTable = withStyles(styles)(OverviewTableInner);
