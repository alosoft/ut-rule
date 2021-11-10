import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fromJS } from 'immutable';
import TitledContentBox from 'ut-front-react/components/TitledContentBox';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import Input from 'ut-front-react/components/Input';
import Property from '../../../../components/Property';
import style from '../style.css';
import * as actions from '../../actions';
import { getRuleProperties } from '../../helpers';
import {validations, errorMessage} from '../../validator';

const destinationProp = 'channel';
const propTypes = {
    mode: PropTypes.string,
    canEdit: PropTypes.bool,
    rule: PropTypes.object,
    actions: PropTypes.object,
    organizations: PropTypes.array,
    fieldValues: PropTypes.object,
    errors: PropTypes.object, // immutable
    channelConfig: PropTypes.object.isRequired
};

const defaultProps = {
    canEdit: true,
    organizations: []
};

class ChannelTab extends Component {
    constructor(props, context) {
        super(props, context);
        this.renderFields = this.renderFields.bind(this);
    }

    renderPriority() {
        const {
            fieldValues,
            errors,
            mode
        } = this.props;
        const changeInput = (field) => {
            this.props.actions.changeInput(field, destinationProp);
        };
        return (
            <div className={style.inputWrapper}>
                <Input
                    label='Priority'
                    keyProp='priority'
                    readonly={mode !== 'create'}
                    value={fieldValues.priority}
                    validators={validations.priority}
                    isValid={!errors.get('priority')} errorMessage={errors.get('priority')}
                    onChange={(field) => changeInput(field)}
                />
            </div>
        );
    }

    renderFields() {
        const {
            canEdit,
            organizations,
            fieldValues,
            channelConfig: { fields }
        } = this.props;
        const changeInput = (field) => {
            this.props.actions.changeInput(field, destinationProp);
        };
        const readonly = !canEdit;

        return (
            <div>
                {fields.organization.visible && <div className={style.inputWrapper}>
                    <Dropdown
                        disabled={readonly}
                        canSelectPlaceholder
                        keyProp='organization'
                        data={organizations}
                        defaultSelected={fieldValues.organization}
                        placeholder='Select Organization'
                        onSelect={(field) => { changeInput(field); }}
                        label={fields.organization.title || 'Organization'}
                    />
                </div>}
            </div>
        );
    }

    renderInfoFields() {
        const { canEdit, rule, actions, fieldValues, errors } = this.props;
        const properties = getRuleProperties(rule);
        const addProperty = () => {
            actions.addProperty(destinationProp);
        };
        const removeProperty = (index) => {
            actions.removeProperty(index, destinationProp);
        };
        const changeInput = (field) => {
            if (field.key.split(',').pop() === 'name' && !field.error && field.value) {
                const isDuplicateProperty = !!properties.find((prop) => { return (prop.name || '').toLowerCase() === (field.value || '').toLowerCase(); });
                isDuplicateProperty && (field.error = true) && (field.errorMessage = errorMessage.propertyNameUnique);
            }
            actions.changeInput(field, destinationProp);
        };
        return (
            <div className={style.contentBox}>
                <div className={style.contentBoxWrapper}>
                    <div className={style.innerContentBoxWrapper}>
                        <TitledContentBox
                            title='Priority'
                            wrapperClassName
                        >
                            {this.renderPriority()}
                        </TitledContentBox>
                    </div>
                    <div className={style.innerContentBoxWrapper}>
                        <TitledContentBox
                            title='Channel Info'
                            wrapperClassName
                        >
                            {this.renderFields()}
                        </TitledContentBox>
                    </div>
                </div>
                <div className={style.contentBoxWrapper}>
                    <TitledContentBox
                        title='Properties'
                        wrapperClassName
                    >
                        <Property
                            canEdit={canEdit}
                            addProperty={addProperty}
                            removeProperty={removeProperty}
                            changeInput={changeInput}
                            properties={(fieldValues || {}).properties || []}
                            errors={errors}
                        />
                    </TitledContentBox>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div>
                {Object.keys(this.props.fieldValues).length > 0 && this.renderInfoFields()}
            </div>
        );
    }
}

ChannelTab.propTypes = propTypes;
ChannelTab.defaultProps = defaultProps;

const mapStateToProps = (state, ownProps) => {
    const { mode, id } = state.ruleProfileReducer.get('config').toJS();
    const immutableRule = state.ruleProfileReducer.getIn([mode, id]);
    return {
        mode,
        canEdit: ownProps.canEdit,
        rule: immutableRule ? immutableRule.toJS() : {},
        organizations: state.ruleProfileReducer.getIn(['nomenclatures', 'organization']).toJS(),
        fieldValues: state.ruleProfileReducer.getIn([mode, id, destinationProp], fromJS({})).toJS(),
        errors: state.ruleProfileReducer.getIn([mode, id, 'errors', destinationProp]) || fromJS({}),
        channelConfig: state.uiConfig.getIn(['profile', 'tabs', 'channel']).toJS()
    };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(actions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(ChannelTab);
