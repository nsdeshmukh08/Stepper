import React, { Fragment, Component } from 'react';
import { ChartTable } from 'component/Table'
import ChartFilter from 'component/Filter/ChartFilter'
import { ComposedBarChart } from 'component/charts/common'
import {
    Row,
    Col
} from "reactstrap";
import Pagination from 'component/Pagination/ChartPagination'
import _ from 'lodash'
import { STAFF_ROLE_ID } from 'helpers/variables';
import { beneficiary_Gender } from 'helpers/tableDataMapper'
import { BeneficaryGenderChart } from 'component/charts/dashboard'

class BeneficaryGender extends Component {

    state = {
        pageCount: 30,
        page: 1,
        districtId: [],
        blockId: [],
        formTypes: [],
        locationType: null,
        search: null
    }

    // LIFECYCLE

    componentDidMount() {
        this.init()
    }

    static getDerivedStateFromProps(nextProps, prevState) {

        //COMPARING AND CHANGING THE FILTERED LOCATION

        if (
            !_.isEqual(prevState.districtId, nextProps.districtId) ||
            !_.isEqual(prevState.blockId, nextProps.blockId) ||
            !_.isEqual(prevState.formTypes, nextProps.formTypes)

        ) {
            return {
                districtId: _.cloneDeep(nextProps.districtId),
                blockId: _.cloneDeep(nextProps.blockId),
                formTypes: _.cloneDeep(nextProps.formTypes)
            }
        }

        //COMPARING AND CHANGING THE SELECTED LOCATIONS

        if (
            !_.isEqual(prevState.locationType, nextProps.locationType) ||
            !_.isEqual(prevState.selectedDistrict, nextProps.selectedDistrict) ||
            !_.isEqual(prevState.selectedBlock, nextProps.selectedBlock)
        ) {
            return {
                locationType: nextProps.locationType,
                selectedDistrict: nextProps.selectedDistrict,
                selectedBlock: nextProps.selectedBlock
            }
        }
        return null
    }

    componentDidUpdate(prevProps) {

        //COMPARING AND GET GRAPH API

        if (
            (
                !_.isEqual(prevProps.districtId, this.props.districtId) ||
                !_.isEqual(prevProps.blockId, this.props.blockId) ||
                !_.isEqual(prevProps.formTypes, this.props.formTypes) ||
                !_.isEqual(prevProps.locationType, this.props.locationType)
            )
        ) {
            this.getGraphData()
        }
    }

    //INIT

    init = () => {
        this.setState({
            locationType: this.props.locationType //SET LOCATION TYPE
        }, () => {
            this.getGraphData() //API CALL
        })
    }

    //HANDLE PAGE NUMBER CHANGES

    handlePageChange = (value) => {
        this.setState({
            page: value
        }, this.getGraphData)
    }

    //HANDLE PAGE COUNT CHANGES

    handlePageCount = (pageCount) => {
        this.setState({
            pageCount,
            page: 1
        }, this.getGraphData)
    }

    //HANDLE SEARCH

    handleSearchChange = (search) => {
        this.setState({
            search
        })
    }

    //SERVICES

    getGraphData = () => {

        const { tabNumber } = this.props

        const {
            pageCount,
            page,
            locationType,
            blockId,
            districtId,
            panchayatId,
            selectedDistrict,
            selectedBlock,
            selectedPanchayat,
            formTypes
        } = this.state

        let data = {
            payload: {
                blockId: selectedBlock ? [selectedBlock] : blockId,
                districtId: selectedDistrict ? [selectedDistrict] : districtId,
                panchayatId: [],
                formTypes: formTypes,
                locationType: locationType,
                "limit": parseInt(pageCount),
                "page": page
            },
            tabNumber
        }

        this.props.getBeneficiaryCharts(data)

    }

    onTableDataClick = (tableData, index) => {

        const {
            match,
            data,
            selectedDistrictName,
            selectedDistrict,
            locationType,
            tabNumber,
            profile
        } = this.props

        let { label, value } = data.location[index]

        //CHECKING THE PERSONA TYPE BASED ON THAT HANDLING REDIRECTION

        if (STAFF_ROLE_ID.SMMU === parseInt(profile.role)) {
            switch (locationType) {
                case 1:
                    this.props.history.push(`${match.path.replace(':tabNumber', tabNumber)}?district=${value}&districtName=${label}`)
                    break;
                case 2:
                    this.props.history.push(`${match.path.replace(':tabNumber', tabNumber)}?district=${selectedDistrict}&districtName=${selectedDistrictName}&block=${value}&blockName=${label}`)
                    break;
            }
        }
        else if (STAFF_ROLE_ID.DMMU === parseInt(profile.role)) {
            switch (locationType) {
                case 2:
                    this.props.history.push(`${match.path.replace(':tabNumber', tabNumber)}?block=${value}&blockName=${label}`)
                    break;
            }
        }



    }

    //FILTERING THE DATA

    getFilteredTableData = () => {
        let { data } = this.props
        let { search } = this.state
        let tableData = data.location
        let filteredData = tableData.filter(data =>
            data.label
                .toLowerCase()
                .includes(search?.toLowerCase())
            || !search
        )
        return filteredData
    }

    render() {

        const { pageCount, page, locationType, search } = this.state

        const { data, loaders } = this.props

        const { pagination } = data.meta

        let chartListData = beneficiary_Gender[
            locationType === 3
                ? 'panchayat'
                : locationType === 2
                    ? 'block'
                    : 'district'
        ]
        chartListData.rows = this.getFilteredTableData()

        return (
            <Fragment>
                {locationType <= 2 //CHECKING WHETHER IT IS NOT PANCHAYAT VIEW
                    ? <div className="bg-white position-relative">
                        <BeneficaryGenderChart graphData={data.graphData} />
                        {
                            loaders.isFetchingChartData ?
                                <div className="absolute-loader-container">
                                    <div className="spinner-border text-primary"></div>
                                </div> : ''
                        }

                    </div>
                    : ''
                }
                <div className="position-relative">
                    <ChartFilter
                        search={search}
                        onSearch={(value) => this.handleSearchChange(value)}
                    />
                    <Row className="no-gutters bg-white mb-3">
                        <Col md="12" className="position-relative">
                            <ChartTable
                                data={chartListData}
                                onClick={this.onTableDataClick}
                            />
                            <Pagination
                                pagination={pagination}
                                handlePageCount={this.handlePageCount}
                                handlePageChange={this.handlePageChange}
                            />
                        </Col>
                    </Row>
                    {
                        loaders.isFetchingChartData ?
                            <div className="absolute-loader-container">
                            </div> : ''
                    }
                </div>
            </Fragment>
        );
    }
}

export default BeneficaryGender;