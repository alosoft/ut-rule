import React, { PropTypes } from 'react';
import {SimpleGrid} from 'ut-front-react/components/SimpleGrid';
import ContextMenu from '../ContextMenu';
import style from './style.css';

export default React.createClass({
    propTypes: {
        data: PropTypes.object,
        columns: PropTypes.object,
        formatedGridData: PropTypes.object,
        selectedConditions: PropTypes.object,
        refresh: PropTypes.func,
        handleCheckboxSelect: PropTypes.func,
        handleHeaderCheckboxSelect: PropTypes.func
    },
    getInitialState(state) {
        return {
            expandedGridColumns: [],
            columns: this.props.columns
        };
    },
    shouldComponentUpdate(nextProps, nextState) {
        return true;
    },
    handleGridExpansion(id) {
        let expandedGridColumns = this.state.expandedGridColumns;
        if (expandedGridColumns.some(v => v === id)) {
            let index = expandedGridColumns.indexOf(id);
            expandedGridColumns.splice(index, 1);
        } else {
            expandedGridColumns.push(id);
        }
        this.setState({expandedGridColumns});
    },
    renderGridColumn(condition, keysToInclude, row, column) {
        let result = [];
        for (let keyToInclude of keysToInclude) {
            if (Array.isArray(condition[keyToInclude])) {
                for (let index in condition[keyToInclude]) {
                    let record = condition[keyToInclude][index];
                    if (index > 4 && !this.state.expandedGridColumns.some(v => v === row.priority)) break;
                    result.push(<div key={result.length}>
                        <b>{record.name + ':'}</b>{record.value}
                    </div>);
                }
            }
        }
        if (row.operationEndDate && column === 'operation') {
            result.push(
              <div key={result.length}>
                  <b>End Date: </b>{row.operationEndDate.slice(0, 10)}
              </div>
            );
        }
        if (row.operationStartDate && column === 'operation') {
            result.push(
              <div key={result.length}>
                  <b>Start Date: </b>{row.operationStartDate.slice(0, 10)}
              </div>
            );
        }
        if (row.destinationAccountId && column === 'destination') {
            result.push(
              <div key={result.length}>
                  <b>Destination Account: </b>{row.destinationAccountId}
              </div>
            );
        }
        return (
          <div>
            {result}
          </div>
        );
    },
    updateColumns(columns) {
        this.setState({
            columns: columns
        });
    },
    handleRowClick(record, index) {
        this.props.handleCheckboxSelect(null, record);
    },
    getData() {
        return Object.keys(this.props.data).map((conditionId, i) => {
            let record = this.props.data[conditionId];
            let condition = record.condition[0];
            let columns = this.state.columns;
            return {
                id: conditionId,
                destinationAccountId: condition.destinationAccountId,
                operationEndDate: condition.operationEndDate,
                operationStartDate: condition.operationStartDate,
                priority: columns.priority.visible && condition.priority,
                channel: columns.channel.visible && this.props.formatedGridData[conditionId],
                operation: columns.operation.visible && this.props.formatedGridData[conditionId],
                source: columns.source.visible && this.props.formatedGridData[conditionId],
                destination: columns.destination.visible && this.props.formatedGridData[conditionId],
                limit: columns.limit.visible && this.props.formatedGridData[conditionId],
                expansion: 'Not Empty',
                refresh: ''
            };
        });
    },
    transformCellValue(value, header, row, isHeader) {
        if (isHeader) {
            return value;
        } else {
            if (!value) {
                return;
            }
            switch (header.name) {
                case 'channel':
                    return this.renderGridColumn(value, ['cs', 'co'], row, 'channel');
                case 'operation':
                    return this.renderGridColumn(value, ['oc'], row, 'operation');
                case 'source':
                    return this.renderGridColumn(value, ['ss', 'sc', 'so'], row, 'source');
                case 'destination':
                    return this.renderGridColumn(value, ['ds', 'dc', 'do'], row, 'destination');
                case 'limit':
                    return this.renderGridColumn(value, ['limit'], row, 'limit');
                case 'expansion':
                    let expansionText = this.state.expandedGridColumns.some(v => v === row.priority) ? 'See less...' : 'See more...';
                    return <a onClick={(e) => { e.preventDefault(); this.handleGridExpansion(row.priority); }}>{expansionText}</a>;
                default:
                    return value;
            }
        }
    },
    render() {
        let data = this.getData();
        let columns = this.state.columns;

        return <SimpleGrid
          ref='grid'
          multiSelect
          fields={[
              {title: columns.priority.title, name: 'priority'},
              {title: columns.channel.title, name: 'channel'},
              {title: columns.operation.title, name: 'operation'},
              {title: columns.source.title, name: 'source'},
              {title: columns.destination.title, name: 'destination'},
              {title: columns.limit.title, name: 'limit'},
              {
                  title: <div>Expansion</div>,
                  name: 'expansion'
              },
              {
                  title: <div style={{float: 'right'}}>
                    <ContextMenu
                      refresh={this.props.refresh}
                      onClose={this.updateColumns}
                      data={this.state.columns}
                    />
                  </div>,
                  name: 'refresh'
              }
          ].filter((column) => (!this.state.columns[column.name] || this.state.columns[column.name].visible))}
          handleCheckboxSelect={this.props.handleCheckboxSelect}
          handleHeaderCheckboxSelect={this.props.handleHeaderCheckboxSelect}
          handleRowClick={this.handleRowClick}
          externalStyle={style}
          mainClassName='dataGridTable'
          rowsChecked={data.filter(x => this.props.selectedConditions[x.id])}
          data={data}
          transformCellValue={this.transformCellValue}
        />;
    }
});
