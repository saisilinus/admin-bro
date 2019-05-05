import React from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'

import PropertyType from '../property-type'
import { Loader, BorderBox, StyledButton } from '../layout'
import { resourceType, actionType, historyType } from '../../types'
import ApiClient from '../../utils/api-client'
import withNotice from '../../store/with-notice'

class Edit extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: true,
      record: { params: {}, populated: {} },
    }
    this.api = new ApiClient()
  }

  componentDidMount() {
    const { resource, action, recordId } = this.props
    this.api.recordAction({
      resourceId: resource.id,
      actionName: action.name,
      recordId,
    }).then((response) => {
      this.setState({
        isLoading: false,
        record: response.data.record,
      })
    })
  }

  handleChange(propertyOrRecord, value) {
    if (typeof value === 'undefined' && propertyOrRecord.params) {
      this.setState({
        record: propertyOrRecord,
      })
    } else {
      this.setState(state => ({
        record: {
          ...state.record,
          params: {
            ...state.record.params,
            [propertyOrRecord]: value,
          },
        },
      }))
    }
  }

  handleSubmit(event) {
    const { resource, recordId, history, addNotice } = this.props
    const { record } = this.state
    this.api.recordAction({
      resourceId: resource.id,
      actionName: 'edit',
      recordId,
      payload: {
        record: record.params,
      },
    }).then((response) => {
      if (response.data.redirectUrl) {
        history.push(response.data.redirectUrl)
        addNotice({
          message: 'Record has been successfully updated!',
        })
      } else {
        addNotice({
          type: 'error',
          message: 'There were errors in the record object. Check them out',
        })
        this.setState(state => ({
          record: {
            ...state.record,
            errors: response.data.record.errors,
          },
        }))
      }
    })
    event.preventDefault()
    return false
  }

  render() {
    const { resource } = this.props
    const properties = resource.editProperties
    const { record, isLoading } = this.state

    if (isLoading) {
      return (
        <Loader />
      )
    }

    return (
      <BorderBox>
        <form onSubmit={this.handleSubmit.bind(this)}>
          {properties.map(property => (
            <PropertyType
              key={property.name}
              where="edit"
              onChange={this.handleChange.bind(this)}
              property={property}
              resource={resource}
              record={record}
            />
          ))}
          <StyledButton as="button" type="submit" className="is-primary">
            <i className="icomoon-save" />
            <span className="btn-text">Save</span>
          </StyledButton>
        </form>
      </BorderBox>
    )
  }
}

Edit.propTypes = {
  resource: resourceType.isRequired,
  action: actionType.isRequired,
  history: historyType.isRequired,
  recordId: PropTypes.string.isRequired,
  addNotice: PropTypes.func.isRequired,
}

export default withNotice(withRouter(Edit))