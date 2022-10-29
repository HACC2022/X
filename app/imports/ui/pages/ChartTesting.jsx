import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import faker from 'faker';
import * as d3 from 'd3';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

async function stockData() {
  const url = 'https://opendata.hawaii.gov/dataset/b6cacc8c-e1c1-4710-bdff-d6a1c16fd10f/resource/caf4dc69-cf11-43dc-b4f9-3c29156d7630/download/ccsche.csv';
  const response = await fetch(url);
  const tabledata = await response.text();
  const table = tabledata.split('\n').slice(1);
  console.log('A');
  console.log(table[-1]);
}
stockData();

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Chart.js Bar Chart',
    },
  },
};

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

export const data = {
  labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
    {
      label: 'Dataset 2',
      data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
};

const ChartTesting = () => (
  <Bar options={options} data={data} />
);

export default ChartTesting;
