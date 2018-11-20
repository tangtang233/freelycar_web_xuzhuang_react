import { Table, Input, Icon, Button, Popconfirm } from 'antd';
import React from 'react';
class EditableCell extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: {
                value: this.props.value,
                editable: false,
            }
        }
    }
    handleChange = (e) => {
        const value = e.target.value;
        this.setState({ value :value});
    }
    check = () => {
        this.setState({ editable: false });
        if (this.props.onChange) {
            this.props.onChange(this.state.value);
        }
    }
    edit = () => {
        this.setState({ editable: true });
    }
    render() {
        return (
            <div className="editable-cell">
                {
                    this.state.editable ?
                        <div className="editable-cell-input-wrapper">
                            <Input
                                value={this.state.value}
                                onChange={this.handleChange}
                                onPressEnter={this.check}
                            />
                            <Icon
                                type="check"
                                className="editable-cell-icon-check"
                                onClick={this.check}
                            />
                        </div>
                        :
                        <div className="editable-cell-text-wrapper">
                            {this.state.value || ' '}
                            <Icon
                                type="edit"
                                className="editable-cell-icon"
                                onClick={this.edit}
                            />
                        </div>
                }
            </div>
        );
    }
}

export default EditableCell