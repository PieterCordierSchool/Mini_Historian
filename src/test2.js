import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTable } from 'react-table';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import './App.css';
import { v4 as uuidv4 } from 'uuid';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const App = () => {
  
  const [data, setData] = useState([]);
  const [generatedData, setGeneratedData] = useState([]);

  const [tagnameFilter, setTagnameFilter] = useState('');
  const [qualityFilter, setQualityFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/getData')
      .then(response => setData(response.data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const generateAutomatedData = (numEntries) => {
    const generatedData = [];
    const prefixes = ['x', 'w', 'c', 'p', 'q'];

    for (let i = 0; i < numEntries; i++) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const number = Math.floor(Math.random() * 5000) + 1;

      const entry = {
        ID: uuidv4(),
        tagname: `${prefix}${number}.value`,
        quality: Math.random() > 0.5 ? 1 : 0,
        value: Math.random() < 0.5 ? Math.floor(Math.random() * 100) : Math.round(Math.random() * 100) / 100,
      };

      generatedData.push(entry);
    }

    return generatedData;
  };

  const generateData = () => {
    const data = generateAutomatedData(50);
    setGeneratedData(data);
  };

  const saveDataToBackend = () => {
    axios.post('http://localhost:5000/api/saveData', generatedData)
      .then(response => alert(response.data.message))
      .catch(error => console.error('Error saving data:', error));
  };

  const filterAndSearchData = (data) => {
    return data.filter(item => {
      const matchesSearch = item.tagname.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilters = 
        (tagnameFilter === '' || item.tagname.toLowerCase().includes(tagnameFilter.toLowerCase())) &&
        (qualityFilter === '' || item.quality.toString() === qualityFilter) &&
        (timeFilter === '' || item.ID.toLowerCase().includes(timeFilter.toLowerCase()));
      return matchesSearch && matchesFilters;
    });
  };

  const filteredData = filterAndSearchData(data);

  const chartData = {
    barChartData: {
      labels: filteredData.map((_, index) => `Entry ${index + 1}`),
      datasets: [{
        label: 'Values',
        data: filteredData.map(item => item.value),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }],
    },
    lineChartData: {
      labels: filteredData.map((_, index) => `Entry ${index + 1}`),
      datasets: [{
        label: 'Value Trend',
        data: filteredData.map(item => item.value),
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      }],
    },
    pieChartData: {
      labels: ['Good Quality', 'Bad Quality'],
      datasets: [{
        data: [
          filteredData.filter(item => item.quality === 1).length,
          filteredData.filter(item => item.quality === 0).length,
        ],
        backgroundColor: ['#36A2EB', '#FF6384'],
        hoverOffset: 4,
      }],
    },
  };

  const columns = React.useMemo(() => [
    { Header: 'ID', accessor: 'ID' },
    { Header: 'Tagname', accessor: 'tagname' },
    { Header: 'Quality', accessor: 'quality' },
    { Header: 'Value', accessor: 'value' },
  ], []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data: filteredData });

  return (
    <div style={{ background: 'linear-gradient(to bottom, #1e3c72, #2a69ac)', minHeight: '100vh' }}>
      {/* Your content here */}
    
    <div className="container">
      
      <h1>Historian Data Dashboard</h1>

      <button onClick={generateData}>Generate Data</button>
      <button onClick={saveDataToBackend} disabled={generatedData.length === 0}>Save Data</button>

      <div>
        <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <input type="text" placeholder="Filter by Tagname" value={tagnameFilter} onChange={(e) => setTagnameFilter(e.target.value)} />
        <input type="text" placeholder="Filter by Quality (0 or 1)" value={qualityFilter} onChange={(e) => setQualityFilter(e.target.value)} />
        <input type="text" placeholder="Filter by Time/ID" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} />
      </div>
c
      <div className="chart-container">
        <div className="chart"><Bar data={chartData.barChartData} /></div>
        <div className="chart"><Line data={chartData.lineChartData} /></div>
        <div className="chart"><Pie data={chartData.pieChartData} /></div>
      </div>

      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default App;
