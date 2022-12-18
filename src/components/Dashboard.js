import { useState, useEffect } from 'react';
import axios from 'axios';
import SimpleBarChart from './BarChart';
import Table from './Table';
import {useNavigate} from 'react-router-dom';

const Dashboard = () => {
    const [graphArr, setGraphArr] = useState([]);
    const [tablesArr, setTablesArr] = useState([]);
    const [file, setFile] = useState();
    const [array, setArray] = useState([]);
    const fileReader = new FileReader();
    const [tableName, setTableName] = useState('');
    const [graphType, setGraphType] = useState('Bar Chart');
    const navigate = useNavigate();

    // FILE READER
    const csvFileToArray = string => {
        const csvHeader = string.slice(0, string.indexOf('\n')).split(',');
        const csvRows = string.slice(string.indexOf('\n') + 1).split('\n');
        const array = csvRows.map(i => {
        const values = i.split(',');
        const obj = csvHeader.reduce((object, header, index) => {
            object[header] = values[index];
            return object;
        }, {});
        return obj;
        });
        setArray(array);
    };
    const headerKeys = Object.keys(Object.assign({}, ...array));

    // PREVIEW CSV FILE TABLE
    const handlePreview = (e) => {
        e.preventDefault();
        if (file) {
        fileReader.onload = function (event) {
            const text = event.target.result;
            csvFileToArray(text);
        };
        fileReader.readAsText(file);
        }
    };

    // SUBMITTING CSV FILE TO DB
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (file) {
        axios
            .post('http://localhost:8000/api/JSON', {
                tableName: tableName,
                headers: headerKeys,
                json: {array}
            })
            .then((response) => {
                console.log('Successfully uploaded');
                console.log(response);
                fetchTablesData();
                setTableName('');
            })
            .catch((error) => console.log(error.response))
        }
    };

    // FETCHING DATA
    const fetchGraphsData = () => {
        axios
            .get('http://localhost:8000/api/graph')
            .then((allGraphs) => {setGraphArr(allGraphs.data)})
            .catch((err) => {console.log(err.response.data)});
    };
    const fetchTablesData = () => {
        axios
            .get('http://localhost:8000/api/JSON')
            .then((allTables) => {setTablesArr(allTables.data)})
            .catch((err) => console.log(err.response));
    };
    useEffect(() => {
        fetchGraphsData();
        fetchTablesData();
    // eslint-disable-next-line
    }, []);

    // GRAPH TYPE SPECIFICATION
    const graphTypes = [
        'Bar Chart',
        'Horizontal Line Chart',
        'Vertical Line Chart',
        'Area Chart',
        'Stacked Area Chart',
        'Percent Area Chart',
        'Stacked Bar Chart'
    ];

    // ADDING A GRAPH
    const addGraph = (e) => {
        e.preventDefault();
        axios
            .post('http://localhost:8000/api/graph', {
                type: graphType,
                tableId: '',
                tableTitle: '',
                xAxis: '',
                yAxis: '',
                y2Axis: '',
                y3Axis: ''
            })
            .then(() => {fetchGraphsData()})
            .catch((err) => {console.log(err.response)})
    };

    // UPDATING GRAPH
    const updateGraph = async (id, tableId, x, y, a, b, tableTitle, type, index) => {
        const graphObj = { ...graphArr[index] };
        axios
            .put(`http://localhost:8000/api/graph/${id}`, {
                type: type,
                tableId: tableId,
                tableTitle: tableTitle,
                xAxis: x,
                yAxis: y,
                y2Axis: a,
                y3Axis: b
            })
            .then(() => {fetchGraphsData()})
            .catch((err) => {console.log(err.response)})
        const arrAfterIndex = [...graphArr.slice(index + 1)];
        setGraphArr(
            [...graphArr.slice(0, index), graphObj].concat(arrAfterIndex)
        );
    };

    // DELETING GRAPH
    const deleteGraph = async (id, graphIndex) => {
        axios
            .delete(`http://localhost:8000/api/graph/${id}`)
            .then(() => {
                const filteredGraphs = graphArr.filter((graph, index) => {
                    return graphIndex !== index;
                });
                setGraphArr(filteredGraphs);
            })
            .catch((err) => {console.log(err.response)});
        fetchGraphsData()
    };

    // DELETING TABLE
    const deleteTable = async (id, tableIndex) => {
        axios
            .delete(`http://localhost:8000/api/JSON/${id}`)
            .then(() => {
                const filteredTables = tablesArr.filter((table, index) => {
                    return tableIndex !== index;
                });
                setTablesArr(filteredTables);
            })
            .catch((err) => {console.log(err.response)})
        fetchTablesData();
    };

    return (
        <div>
            <div className='Main'>
                <div className='Tables'>
                    <div>
                        <form>
                            <h5>Add a Table</h5>
                            <div>
                                <input
                                    type={'file'}
                                    id={'csvFileInput'}
                                    accept={'.csv'}
                                    onChange={(e)=>{setFile(e.target.files[0])}}
                                />
                            </div>
                        <div>
                            <input placeholder='Table Name' type='text' value={tableName} onChange={(e) => setTableName(e.target.value)} />
                        </div>
                            <button onClick={(e) => {handlePreview(e)}} className='btn btn-secondary btn-sm'>PREVIEW CSV</button>
                            <button onClick={(e) => {handleSubmit(e)}} className='btn btn-secondary btn-sm'>SUBMIT CSV</button>
                        </form>
                    </div>
                    <div className='Records'>
                        {tablesArr.map((table, index) => {
                            return (
                                <div key={index}>
                                    <Table
                                        table={ table }
                                        index={ index }
                                        deleteTable={ deleteTable }
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className='Graphs'>
                    <div className='Buttons'>
                        <form onSubmit={addGraph}>
                            <select className='form-select form-select-sm mb-1' onChange={(e) => setGraphType(e.target.value)} defaultValue={graphType}>
                                {graphTypes.map((type, index) => {
                                    return (
                                        <option key={index} value={type}>{type}</option>
                                    )
                                })}
                            </select>
                            <button className='btn btn-warning'>Add Graph</button>
                        </form>
                    </div>
                    {graphArr.map((graph, index) => {
                        return (
                            <div key={index}>
                                { graph.type === 'Bar Chart' ?
                                    <SimpleBarChart
                                        tablesArr={ tablesArr }
                                        graph={ graph }
                                        index={ index }
                                        updateGraph={ updateGraph }
                                        deleteGraph={ deleteGraph }
                                    />
                                : graph.type === 'Horizontal Line Chart' ?
                                    <HorizontalLineChart
                                        tablesArr={ tablesArr }
                                        graph={ graph }
                                        index={ index }
                                        updateGraph={ updateGraph }
                                        deleteGraph={ deleteGraph }
                                    />
                                : graph.type === 'Vertical Line Chart' ?
                                    <VerticalLineChart
                                        tablesArr={ tablesArr }
                                        graph={ graph }
                                        index={ index }
                                        updateGraph={ updateGraph }
                                        deleteGraph={ deleteGraph }
                                    />
                                : graph.type === 'Area Chart' ?
                                    <SimpleAreaChart
                                        tablesArr={ tablesArr }
                                        graph={ graph }
                                        index={ index }
                                        updateGraph={ updateGraph }
                                        deleteGraph={ deleteGraph }
                                    />
                                : graph.type === 'Stacked Area Chart' ?
                                    <StackedAreaChart
                                        tablesArr={ tablesArr }
                                        graph={ graph }
                                        index={ index }
                                        updateGraph={ updateGraph }
                                        deleteGraph={ deleteGraph }
                                    />
                                : graph.type === 'Percent Area Chart' ?
                                    <PercentAreaChart
                                        tablesArr={ tablesArr }
                                        graph={ graph }
                                        index={ index }
                                        updateGraph={ updateGraph }
                                        deleteGraph={ deleteGraph }
                                    />
                                : graph.type === 'Stacked Bar Chart' ?
                                    <StackedBarChart
                                        tablesArr={ tablesArr }
                                        graph={ graph }
                                        index={ index }
                                        updateGraph={ updateGraph }
                                        deleteGraph={ deleteGraph }
                                    />
                                : 
                                    <SimpleBarChart
                                        tablesArr={ tablesArr }
                                        graph={ graph }
                                        index={ index }
                                        updateGraph={ updateGraph }
                                        deleteGraph={ deleteGraph }
                                    />
                                }
                            </div>
                        )
                    })}
                </div>
                {/* <div className='Chat'> */}
                    {/* <h5>Chat</h5> */}
                {/* </div> */}
            </div>
        </div>
    )
}

export default Dashboard;