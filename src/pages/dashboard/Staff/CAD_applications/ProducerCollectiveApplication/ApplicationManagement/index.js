import React, { Component, Fragment } from "react";
import { HeaderWithApplicationStatus } from 'component/Header/Staff'
import ApplicationFilter from 'component/Filter/ApplicationFilter'
import { Container,Row, Col } from "reactstrap";
import Table from "component/Table";
import Pagination from "component/Pagination";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as listApplicationActions from "action/staff/manageApplication";
import _ from "lodash";
import { axios, API, API_BOOK } from "service";
import BasicTab from 'component/Tabs/BasicTab'
import { StaffFullApplicationList,StaffShortApplicationList } from 'helpers/tableDataMapper'
import { APPLICATION_TABS } from 'helpers/variables'
import { ORDER } from 'helpers/variables.js'

const { GENERATE_FORM_ID_API } = API_BOOK.APPLICATION;

class UserManagement extends Component {
    state = {
        search: "",
        list: [],
        applicationCount: {},
        selectedApplicationId:null, 
        page: 1,
        total_pages: 1,
        role: 7,
        sortBy: ORDER[1].value,
        status: [2],
        limit: 10,
        cancelToken: axios.CancelToken.source(),
    };

    //LIFECYCLE

    componentDidMount() {
        this.getApplicationList()
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const { applications } = nextProps;
        if (_.cloneDeep(applications.list) !== _.cloneDeep(prevState.list))
            return {
                list: applications.list,
                total_pages: applications.pagination.total_pages,
                applicationCount: applications.applicationCount,
                selectedApplicationId : applications.selectedApplicationId
            };
        return null;
    }

    //EVENTS
    onSelect = (name, value) => {
        this.setState(
            {
                [name]: value,
                page: 1,
            },
            this.getApplicationList
        );
    }

    nextpage = (page) => {
        this.setState({ page }, this.getApplicationList);
    };

    onChange = (name, value) => {
        this.setState(
            {
                [name]: value,
                page: 1,
            },
            this.getApplicationList
        );
    };

    getApplicationDetails = (data) => {
        this.props.getApplicationDetails(data);
        if (!this.props.isDetailMode) this.props.toggle();
    };

    //SERVICE

    getApplicationList = () => {
        const {
            cancelToken,
            status,
            sortBy,
            search,
            page,
            limit,
        } = this.state;
        const { address } = this.props.profile
        let data = {
            page,
            status,
            sortBy,
            search,
            limit
        };
        if (this.props.isDetailMode) this.props.toggle();
        this.props.getApplicationList(data, cancelToken.token);
    };

    generateFormId = async (name) => {
        const { cancelToken } = this.state
        let requestPayload = {
            ...GENERATE_FORM_ID_API,
            cancelToken: cancelToken.token,
        };
        let response = await API(requestPayload);
        if (response.status === 200) {
            localStorage.setItem('createAppformId', response.data.data.formId)
            this.props.history.push('/application/productiveCollective')
        }
    }

    render() {

        const {  isDetailMode, page,loaders } = this.props;

        const { list, status, sortBy, search, applicationCount,total_pages,selectedApplicationId } = this.state;

        let tableData = !isDetailMode ? StaffFullApplicationList : StaffShortApplicationList

        tableData.rows = list;

        let disableCreateApp = this.props.profile.role === 3 ? false : true;

        let SelectedApplicationIndex = list.findIndex(data => data.formId === selectedApplicationId)

        let showApproveAccess;

        let SMPU =  this.props.profile.role == 2 ? true : false;
        if(SMPU)
            showApproveAccess = false;

        return (
            <Container fluid className="p-0">
                <HeaderWithApplicationStatus
                    name="Producer Collectives"
                    applicationCount={applicationCount}
                    isDetailMode={isDetailMode}
                    showApproveAccess ={ showApproveAccess }
                />
                <Row noGutters>
                    <Col md="12">
                        <BasicTab
                            tabs={APPLICATION_TABS}
                            name="status"
                            onChange={this.onChange}
                            activeTab={status}
                        />
                    </Col>
                </Row>
                <ApplicationFilter
                    onSearch={(value) => this.onChange('search', value)}
                    search={search}
                    order={sortBy}
                    disableCreateApp = {disableCreateApp}
                    onOrderSelect={(value) => this.onSelect('sortBy', value)}
                    isDetailMode={isDetailMode}
                    onCreateApplicationBtnClick={this.generateFormId}
                />
                <Row noGutters>
                    <Col md="12" className="px-3">
                        <Table
                            data={tableData}
                            activeRow={SelectedApplicationIndex}
                            onClick={this.getApplicationDetails}
                            isLoading={loaders.isFetchingApplicationList}
                            className="theme-light-grey with-dot"
                        />
                        <div className="pt-3">
                            <Pagination 
                                pageCount={total_pages} 
                                page={page}
                                onPageChange={this.nextpage}
                            />
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }
}
const mapStateToProps = ({ staff, profile,loaders }) => {
    return {
        applications: staff.applications,
        profile,
        loaders
    };
};

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(listApplicationActions, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(UserManagement);
