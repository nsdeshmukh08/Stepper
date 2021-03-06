import React, { useContext } from 'react';
import { Row, Col } from 'reactstrap';
import ActivityTable from './ActivityTable';
import { ThemeContext } from 'helpers';
import FormInput from 'component/inputs/FormInput';

const LossForm = ({ ieLossIncurred, ...rest }) => {
  let themeData = useContext(ThemeContext);
  //Narayan
  //console.log('++act', ieLossIncurred);
  return (
    <Row className="form-body p-4 activity-form-main">
      <Col xl="7" lg="12" sm="12">
        <h2 className="title-two mb-4 mt-3">{themeData.lossIncurred}</h2>
        <p className="small-size mt-3">{themeData.lossIncurredDueToCovid}</p>
        <Row>
          <Col className="member-shg">
            <FormInput
              type="radio"
              options={[
                {
                  label: 'Yes',
                  value: true,
                },
                {
                  label: 'No',
                  value: false,
                },
              ]}
              name="isLossIncurred"
              onChange={rest.onChange}
              error={ieLossIncurred['isLossIncurred']}
              value={ieLossIncurred['isLossIncurred']}
            />
          </Col>
        </Row>

        <ActivityTable
          onAddOrRemoveActivity={rest.onAddOrRemoveActivity}
          data={ieLossIncurred.lossIncurredList}
          onChange={rest.onChange}
        />
      </Col>
    </Row>
  );
};

export default LossForm;
