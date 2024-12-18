import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTable } from 'react-table';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { v4 as uuidv4 } from 'uuid';
import './App.css';
import Papa from 'papaparse';


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
  const [searchQuery, setSearchQuery] = useState('');
  const [tagnameFilter, setTagnameFilter] = useState('');
  const [qualityFilter, setQualityFilter] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/getData')
      .then(response => setData(response.data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const records = results.data.map(item => ({
            ID: uuidv4(),
            tagname: item.tagname,
            quality: parseInt(item.quality, 10),
            value: parseFloat(item.value),
          }));
          setGeneratedData(records);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
        },
      });
    }
  };

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
    const numEntries = parseInt(prompt('How many records would you like to generate?', '50'), 10);
    if (!isNaN(numEntries) && numEntries > 0) {
      const data = generateAutomatedData(numEntries);
      setGeneratedData(data);
    } else {
      alert('Please enter a valid number');
    }
  };

  const saveDataToBackend = () => {
    axios.post('http://localhost:5000/api/saveData', generatedData)
      .then(response => {
        alert(response.data.message);

        // Refresh data from backend after saving
        axios.get('http://localhost:5000/api/getData')
          .then(response => setData(response.data))
          .catch(error => console.error('Error refreshing data:', error));

        // Clear generated data after saving
        setGeneratedData([]);
      })
      .catch(error => console.error('Error saving data:', error));
  };

  const deleteAllData = () => {
    if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
      axios.delete('http://localhost:5000/api/deleteData')
        .then(response => {
          alert(response.data.message);
          setData([]);
        })
        .catch(error => console.error('Error deleting data:', error));
    }
  };


  const filterAndSearchData = (data) => {
    return data.filter(item => {
      // Ensure item.tagname is not null or undefined before calling toLowerCase
      const tagname = item.tagname ? item.tagname.toLowerCase() : '';
      const matchesSearch = tagname.includes(searchQuery.toLowerCase());
      const matchesTagname = tagname.includes(tagnameFilter.toLowerCase());
      const matchesQuality = qualityFilter === '' || item.quality.toString() === qualityFilter;

      return matchesSearch && matchesTagname && matchesQuality;
    });
  };

  const filteredData = filterAndSearchData(data);

  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          font: {
            size: 14,
            weight: 'bold',
            color: 'white',
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Entry Number',
          color: 'white',
        },
        ticks: {
          color: 'white',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Value',
          color: 'white',
        },
        ticks: {
          color: 'white',
        },
      },
    },
  };

  const chartData = {
    barChartData: {
      labels: data.map((_, index) => `Entry ${index + 1}`),
      datasets: [{
        label: 'Values',
        data: data.map(item => item.value),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }],
    },
    lineChartData: {
      labels: data.map((_, index) => `Entry ${index + 1}`),
      datasets: [{
        label: 'Value Trend',
        data: data.map(item => item.value),
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      }],
    },
    pieChartData: {
      labels: ['Good Quality', 'Bad Quality'],
      datasets: [{
        data: [
          data.filter(item => item.quality === 1).length,
          data.filter(item => item.quality === 0).length,
        ],
        backgroundColor: ['#36A2EB', '#FF6384'],
        hoverOffset: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
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
    <div className="container">
      <h1>Historian Data Dashboard</h1>

      <div className="actions">
        <button onClick={generateData}>Generate Data</button>
        <button onClick={saveDataToBackend} disabled={generatedData.length === 0}>Save Data</button>
        <button onClick={deleteAllData}>Delete All Data</button>
        <input type="file" accept=".csv" onChange={handleFileUpload} />
      </div>

      <div className="filters">
        <input type="text" placeholder="Search by Tagname" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <input type="text" placeholder="Filter by Tagname" value={tagnameFilter} onChange={(e) => setTagnameFilter(e.target.value)} />
        <input type="text" placeholder="Filter by Quality (0 or 1)" value={qualityFilter} onChange={(e) => setQualityFilter(e.target.value)} />
      </div>

      <div className="data-table-container">
        <table {...getTableProps()} className="data-table">
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th key={column.id} {...column.getHeaderProps()}>{column.render('Header')}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <tr key={row.id} {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <td key={cell.column.id} {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="chart-container">
        <h2>Bar Chart: Value Distribution</h2>
        <div className="chart"><Bar data={chartData.barChartData} options={chartOptions} /></div>

        <h2>Line Chart: Value Trend</h2>
        <div className="chart"><Line data={chartData.lineChartData} options={chartOptions} /></div>

        <h2>Pie Chart: Quality Distribution</h2>
        <div className="pie-chart-container">
          <Pie data={chartData.pieChartData} options={chartOptions} />
        </div>
      </div>

    </div>
  );
};

export default App;
