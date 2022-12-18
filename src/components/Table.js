import { Link } from 'react-router-dom';

const Table = (props) => {
    const { table, index, deleteTable } = props;
    return (
        <div className='TableRecord'>
            <Link to={`/JSON/${table._id}`}>
                <p className='Record'>{table.tableName}</p>
            </Link>
            <span className="Delete" onClick={() => deleteTable(props.table._id, index)}>&times;</span>
        </div>
    )
}

export default Table;