import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

const ChartRenderer = ({ visualization, className = '' }) => {
  if (!visualization || !visualization.data) {
    return null;
  }

  const { type, title, data, options = {} } = visualization;

  // Helper function to detect data structure and extract keys
  const analyzeDataStructure = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return { labelKey: 'label', valueKeys: ['value'] };
    }

    const sampleDataPoint = data[0];
    const dataKeys = Object.keys(sampleDataPoint);
    
    // Find the key that represents the category/label
    const labelKey = dataKeys.find(key => {
      const value = sampleDataPoint[key];
      return (
        typeof value === 'string' || 
        key.toLowerCase().includes('topic') || 
        key.toLowerCase().includes('name') || 
        key.toLowerCase().includes('label') ||
        key.toLowerCase().includes('category') ||
        key.toLowerCase().includes('x')
      );
    }) || dataKeys[0];
    
    // Find all numeric keys that should be rendered as data series
    const valueKeys = dataKeys.filter(key => {
      const value = sampleDataPoint[key];
      return key !== labelKey && typeof value === 'number';
    });
    
    // If no numeric keys found, fall back to common value keys
    const finalValueKeys = valueKeys.length > 0 ? valueKeys : ['value', 'y'];
    
    return { labelKey, valueKeys: finalValueKeys };
  };

  const renderChart = () => {
    const { labelKey, valueKeys } = analyzeDataStructure(data);

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey={labelKey}
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              {valueKeys.map((key, index) => (
                <Line 
                  key={key}
                  type="monotone" 
                  dataKey={key} 
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: COLORS[index % COLORS.length], strokeWidth: 2 }}
                  name={key.charAt(0).toUpperCase() + key.slice(1)}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey={labelKey}
                stroke="#64748b"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              {valueKeys.map((key, index) => (
                <Bar 
                  key={key}
                  dataKey={key} 
                  fill={COLORS[index % COLORS.length]}
                  radius={[4, 4, 0, 0]}
                  name={key.charAt(0).toUpperCase() + key.slice(1)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        // For pie charts, we need to transform the data if it's not in the right format
        const pieData = data.map((item, index) => {
          const value = valueKeys.length > 0 ? item[valueKeys[0]] : item.value;
          const label = item[labelKey] || item.label || `Item ${index + 1}`;
          return {
            name: label,
            value: value,
            label: label
          };
        });

        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey={labelKey}
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              {valueKeys.map((key, index) => (
                <Area 
                  key={key}
                  type="monotone" 
                  dataKey={key} 
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.3}
                  name={key.charAt(0).toUpperCase() + key.slice(1)}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        // For scatter plots, we need x and y coordinates
        const xKey = labelKey.toLowerCase().includes('x') ? labelKey : (valueKeys[0] || 'x');
        const yKey = valueKeys.find(key => key.toLowerCase().includes('y')) || valueKeys[1] || valueKeys[0] || 'y';
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey={xKey}
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                dataKey={yKey}
                stroke="#64748b"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Scatter 
                dataKey={yKey}
                fill={COLORS[0]}
                name={`${xKey} vs ${yKey}`}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Unsupported chart type: {type}</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-lg border border-gray-200 p-6 shadow-sm ${className}`}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          {title}
        </h3>
      )}
      <div className="w-full">
        {renderChart()}
      </div>
      {options.description && (
        <p className="text-sm text-gray-600 mt-4 text-center">
          {options.description}
        </p>
      )}
    </motion.div>
  );
};

export default ChartRenderer;
