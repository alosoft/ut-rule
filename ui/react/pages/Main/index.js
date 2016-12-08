import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Grid from '../../components/Grid';
import Dialog from '../../components/Dialog';
import Prompt from '../../components/Prompt';
import mainStyle from 'ut-front-react/assets/index.css';
import { AddTab } from 'ut-front-react/containers/TabMenu';
import Header from 'ut-front-react/components/PageLayout/Header';
import GridToolbox from 'ut-front-react/components/SimpleGridToolbox';
import * as actionCreators from './actionCreators';
import style from './style.css';
import classnames from 'classnames';

const Main = React.createClass({
    propTypes: {
        rules: PropTypes.object,
        nomenclatures: PropTypes.object,
        ready: PropTypes.bool,
        empty: PropTypes.bool,
        actions: PropTypes.object,
        location: PropTypes.object
    },
    getInitialState() {
        return {
            selectedConditions: {},
            canEdit: false,
            canDelete: false,
            prompt: false,
            dialog: {
                open: false,
                conditionId: null
            }
        };
    },
    fetchData() {
        this.props.actions.fetchRules();
        this.props.actions.fetchNomenclatures({
            alias: [
                'currency',
                'channel',
                'country',
                'region',
                'city',
                'organization',
                'role',
                'operation',
                'supervisor',
                'product',
                'account'
            ]
        });
    },
    componentWillMount() {
        this.fetchData();
    },
    componentWillReceiveProps(nextProps) {
        if (nextProps.empty) {
            this.fetchData();
        }
    },
    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.ready;
    },
    handleCheckboxSelect(isSelected, data) {
        let selectedConditions = this.state.selectedConditions;
        if (isSelected === null) {
            isSelected = selectedConditions[data.id];
        }
        if (isSelected) {
            delete selectedConditions[data.id];
        } else {
            selectedConditions[data.id] = true;
        }
        let count = Object.keys(selectedConditions).length;
        this.setState({
            selectedConditions: selectedConditions,
            canEdit: count === 1,
            canDelete: count > 0
        });
        return !isSelected;
    },
    handleHeaderCheckboxSelect(isSelected) {
        this.setState({
            selectedConditions: isSelected ? {} : Object.keys(this.props.rules).reduce((all, key) => { all[key] = true; return all; }, {}),
            canEdit: false,
            canDelete: !isSelected
        });
    },
    createBtnOnClick() {
        this.setState({
            dialog: {
                open: true,
                conditionId: null
            }
        });
    },
    editBtnOnClick() {
        this.setState({
            dialog: {
                open: true,
                conditionId: Object.keys(this.state.selectedConditions)[0]
            }
        });
    },
    dialogOnClose() {
        this.setState({
            dialog: {
                open: false,
                conditionId: null
            }
        });
    },
    dialogOnSave(data) {
        let action = this.state.dialog.conditionId ? 'editRule' : 'addRule';
        this.setState(this.getInitialState(), () => this.props.actions[action](data));
    },
    removeRules() {
        let conditionsArray = Object.keys(this.state.selectedConditions).map((key) => (parseInt(key, 10)));
        this.setState(this.getInitialState(), () => this.props.actions.removeRules({
            conditionId: conditionsArray
        }));
    },
    refresh() {
        this.setState(this.getInitialState(), () => this.props.actions.reset());
    },
    showPrompt() {
        this.setState({
            prompt: true
        });
    },
    hidePrompt() {
        this.setState({
            prompt: false
        });
    },
    render() {
        if (!this.props.ready) {
            return null;
        }
        return <div className={classnames(mainStyle.contentTableWrap, style.contentTableWrap)}>
            <AddTab pathname={this.props.location.pathname} title='Rule Management' />
            <Header text='Rule Management' buttons={[{text: 'Create Rule', onClick: this.createBtnOnClick}]} />

            <div className={mainStyle.tableWrap}>
                <div className={classnames(mainStyle.actionBarWrap, style.actionBarWrap)}>
                    <GridToolbox opened title='' >
                        <button onClick={this.editBtnOnClick} className='button btn btn-primary' disabled={!this.state.canEdit}>
                            Edit
                        </button>
                        <button onClick={this.showPrompt} className={classnames('button btn btn-primary', style.deleteButton)} disabled={!this.state.canEdit} >
                            Delete
                        </button>
                    </GridToolbox>
                </div>
                <div className={style.grid} >
                    {this.state.dialog.open &&
                        <Dialog
                          ref='dialog'
                          open={this.state.dialog.open}
                          data={this.props.rules[this.state.dialog.conditionId]}
                          nomenclatures={this.props.nomenclatures}
                          onSave={this.dialogOnSave}
                          onClose={this.dialogOnClose}
                        />
                    }
                    {this.state.prompt &&
                        <Prompt
                          ref='prompt'
                          open={this.state.prompt}
                          message={
                            'You are about to delete ' +
                            (
                                Object.keys(this.state.selectedConditions).length === 1
                                    ? '1 rule'
                                    : Object.keys(this.state.selectedConditions).length + ' rules'
                            ) +
                            '. Would you like to proceed?'
                        }
                          onOk={this.removeRules}
                          onCancel={this.hidePrompt}
                        />
                    }
                    <Grid
                      ref='grid'
                      refresh={this.refresh}
                      data={this.props.rules}
                      selectedConditions={this.state.selectedConditions}
                      nomenclatures={this.props.nomenclatures}
                      handleCheckboxSelect={this.handleCheckboxSelect}
                      handleHeaderCheckboxSelect={this.handleHeaderCheckboxSelect}
                    />
                    </div>
            </div>
            {false &&
                <div>
                    <div classNames={style.rulesNomenclatures}>
                        RULES <br /><hr /><br /><pre>{JSON.stringify(this.props.rules, null, 2)}</pre>
                    </div>
                    <div classNames={style.rulesNomenclatures}>
                        NOMENCLATURES <br /><hr /><br /><pre>{JSON.stringify(this.props.nomenclatures, null, 2)}</pre>
                    </div>
                </div>
            }
        </div>;
    }
});

export default connect(
    (state, ownProps) => {
        return {
            rules: state.main.fetchRules,
            nomenclatures: state.main.fetchNomenclatures,
            ready: !!(state.main.fetchRules && state.main.fetchNomenclatures),
            empty: Object.keys(state.main).length === 0
        };
    },
    (dispatch) => {
        return {
            actions: bindActionCreators(actionCreators, dispatch)
        };
    }
)(Main);
