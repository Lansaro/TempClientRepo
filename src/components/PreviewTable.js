import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PreviewTable = () => {
    // console.log(useParams());
    const [apiData, setApiData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const { id } = useParams();
    useEffect(() => {
        axios
            .get(`http://localhost:8000/api/JSON/${id}`)
            .then((response) => {
                // console.log(response.data)
                setHeaders(response.data.headers);
                setApiData(response.data.json.array);
            })
            .catch((error) => {
                console.log(error.response)
            })
    // eslint-disable-next-line
    }, []);
    console.log(apiData);
    return (
        <div className='Preview'>
            <table>
                <thead>
                    <tr key={'header'}>
                    {headers.map((key) => (
                        <th>{key}</th>
                    ))}
                    </tr>
                </thead>
                <tbody>
                    {apiData.map((item) => (
                    <tr key={item.id}>
                        {Object.values(item).map((val) => (
                        <td>{val}</td>
                        ))}
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default PreviewTable;