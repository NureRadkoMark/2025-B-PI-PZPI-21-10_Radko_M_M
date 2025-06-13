import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
    BarChart, Bar
} from 'recharts';
import { FiDownload, FiDollarSign, FiClock, FiCalendar, FiAlertCircle, FiTrendingUp, FiCreditCard } from 'react-icons/fi';
import { FaParking, FaChartLine, FaMoneyBillWave } from 'react-icons/fa';
import apiService from "../api/apiService";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../styles/ParkingStatistics.css';

const COLORS = ['#2ecc71', '#27ae60', '#1abc9c', '#16a085', '#3498db', '#f1c40f'];
const TIME_RANGES = [
    { label: '24 Hours', value: '1d', icon: <FiClock /> },
    { label: '3 Days', value: '3d', icon: <FiCalendar /> },
    { label: 'Week', value: '7d', icon: <FiTrendingUp /> },
    { label: 'Month', value: '30d', icon: <FaChartLine /> }
];

const convertUTCToLocal = (hourUTC) => {
    const localHour = (hourUTC + new Date().getTimezoneOffset() / -60) % 24;
    return localHour < 0 ? 24 + localHour : Math.floor(localHour);
};

const filterDataByTimeRange = (data, range) => {
    if (!data || data.length === 0) return data;

    const now = new Date();
    let cutoffDate = new Date(now);

    switch(range) {
        case '1d':
            cutoffDate.setDate(now.getDate() - 1);
            break;
        case '3d':
            cutoffDate.setDate(now.getDate() - 3);
            break;
        case '7d':
            cutoffDate.setDate(now.getDate() - 7);
            break;
        case '30d':
            cutoffDate.setDate(now.getDate() - 30);
            break;
        default:
            return data;
    }

    return data.filter(item => {
        const itemDate = new Date(item.date || (item.hour ? new Date().setHours(item.hour) : new Date()));
        return itemDate >= cutoffDate;
    });
};

const ParkingStatisticsPage = () => {
    const [stats, setStats] = useState(null);
    const [charts, setCharts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [timeRange, setTimeRange] = useState('7d');
    const [activeTab, setActiveTab] = useState('overview');
    const reportRef = useRef();

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('jwtToken');
            let parkingID = localStorage.getItem('ParkingID');

            if (localStorage.getItem('Role') === 'manager') {
                parkingID = await apiService.getParkingID(token);
                localStorage.setItem('ParkingID', parkingID);
            }

            const data = await apiService.getStatisticParkingInfo(token, parkingID);
            setStats(data.statistics);
            setCharts(data.analyticsCharts);
            setRecommendations(data.recommendation || []);
        } catch (err) {
            console.error('Failed to load statistics:', err);
            setError('Failed to load statistics. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, []);

    const exportToPDF = async () => {
        try {
            const element = reportRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
            pdf.save('parking-statistics.pdf');
        } catch (err) {
            console.error('Failed to export PDF:', err);
            setError('Failed to generate PDF. Please try again.');
        }
    };

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleTimeRangeChange = (range) => {
        setTimeRange(range);
    };

    if (loading) {
        return (
            <div className="statistics-container flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-lg text-green-700">Loading parking statistics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="statistics-container flex items-center justify-center p-6">
                <div className="max-w-md bg-white rounded-xl shadow-md p-6 text-center">
                    <FiAlertCircle className="text-red-500 text-5xl mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-green-800 mb-2">Error Loading Data</h2>
                    <p className="text-green-700 mb-4">{error}</p>
                    <button
                        onClick={fetchStats}
                        className="btn btn-primary"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="statistics-container flex items-center justify-center p-6">
                <div className="max-w-md bg-white rounded-xl shadow-md p-6 text-center">
                    <FiAlertCircle className="text-yellow-500 text-5xl mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-green-800 mb-2">No Data Available</h2>
                    <p className="text-green-700 mb-4">No statistics found for this parking lot.</p>
                    <button
                        onClick={fetchStats}
                        className="btn btn-primary"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    const pieData = [
        { name: 'Occupied', value: stats.takenPlaces },
        { name: 'Available', value: stats.freePlaces },
    ];

    const filteredCharts = charts ? {
        dailyReservations: filterDataByTimeRange(charts.dailyReservations, timeRange),
        hourlyReservations: charts.hourlyReservations, // Hourly data doesn't need filtering
        revenueChart: filterDataByTimeRange(charts.revenueChart, timeRange),
        payoutChart: filterDataByTimeRange(charts.payoutChart, timeRange)
    } : null;

    return (
        <div className="statistics-container" ref={reportRef}>
            {/* Header Section */}
            <div className="stat-card fade-in mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-green-800">
                            Parking Statistics Dashboard
                        </h1>
                        <p className="text-green-600">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <button
                        onClick={exportToPDF}
                        className="btn btn-primary"
                    >
                        <FiDownload /> Export Report
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="tabs">
                <div
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <FaParking className="inline mr-2" /> Overview
                </div>
                <div
                    className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    <FaChartLine className="inline mr-2" /> Analytics
                </div>
                <div
                    className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recommendations')}
                >
                    <FiAlertCircle className="inline mr-2" /> Recommendations
                </div>
            </div>

            {/* Main Content */}
            {activeTab === 'overview' && (
                <div className="grid-container">
                    {/* Parking Info Card */}
                    <div className="stat-card fade-in">
                        <div className="card-header">
                            <FaParking /> Parking Overview
                        </div>
                        <div className="card-body">
                            <div className="mb-4">
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="metric">
                                    <span className="metric-label">Total Spaces</span>
                                    <span className="metric-value">{stats.totalPlaces}</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Occupied</span>
                                    <span className="metric-value">{stats.takenPlaces}</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Available</span>
                                    <span className="metric-value">{stats.freePlaces}</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Demand Factor</span>
                                    <span className="metric-value">{stats.demandFactor}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Space Usage Pie Chart */}
                    <div className="stat-card fade-in">
                        <div className="card-header">
                            <FiClock /> Current Space Usage
                        </div>
                        <div className="card-body">
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => [`${value} spaces`, '']}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Info */}
                    <div className="stat-card fade-in">
                        <div className="card-header">
                            <FiDollarSign /> Pricing Information
                        </div>
                        <div className="card-body">
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="metric text-center">
                                    <span className="metric-label">Min Price</span>
                                    <span className="metric-value">
                    {stats.minPrice} {stats.currency}
                  </span>
                                </div>
                                <div className="metric text-center">
                                    <span className="metric-label">Avg Price</span>
                                    <span className="metric-value">
                    {stats.averagePrice} {stats.currency}
                  </span>
                                </div>
                                <div className="metric text-center">
                                    <span className="metric-label">Max Price</span>
                                    <span className="metric-value">
                    {stats.maxPrice} {stats.currency}
                  </span>
                                </div>
                            </div>
                            <div className="metric">
                                <span className="metric-label">Current Balance</span>
                                <span className="metric-value">
                  {stats.parkingBalance} {stats.currency}
                </span>
                            </div>
                            <button className="btn btn-primary w-full mt-4">
                                <FiCreditCard /> Cash Out
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="stat-card fade-in">
                        <div className="card-header">
                            <FiTrendingUp /> Quick Statistics
                        </div>
                        <div className="card-body">
                            <div className="space-y-4">
                                <div className="metric">
                                    <span className="metric-label">Total Reservations</span>
                                    <span className="metric-value">{stats.reservationCount}</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Peak Hour</span>
                                    <span className="metric-value">
                    {stats.projectedLoad?.peakHour !== undefined
                        ? `${convertUTCToLocal(stats.projectedLoad.peakHour)}:00 - ${convertUTCToLocal(stats.projectedLoad.peakHour)+1}:00`
                        : 'N/A'}
                  </span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Current Occupancy</span>
                                    <span className="metric-value">
                    {((stats.takenPlaces / stats.totalPlaces) * 100).toFixed(1)}%
                  </span>
                                </div>
                                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <p className="text-yellow-700 text-sm">
                                        <span className="font-semibold">Tip:</span> {stats.projectedLoad?.recommendation || 'Monitor your parking trends regularly.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'analytics' && filteredCharts && (
                <div className="fade-in">
                    {/* Time Range Selector */}
                    <div className="stat-card mb-6">
                        <div className="card-header">
                            <FiCalendar /> Select Time Range
                        </div>
                        <div className="card-body">
                            <div className="flex flex-wrap gap-2">
                                {TIME_RANGES.map((range) => (
                                    <button
                                        key={range.value}
                                        onClick={() => handleTimeRangeChange(range.value)}
                                        className={`time-range-btn ${timeRange === range.value ? 'active' : ''}`}
                                    >
                                        {range.icon} {range.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid-container">
                        {/* Hourly Load Chart */}
                        <div className="stat-card">
                            <div className="card-header">
                                <FiClock /> Hourly Load
                            </div>
                            <div className="card-body">
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={filteredCharts.hourlyReservations}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                            <XAxis
                                                dataKey="hour"
                                                tickFormatter={(hour) => `${hour}:00`}
                                            />
                                            <YAxis />
                                            <Tooltip
                                                labelFormatter={(hour) => `Hour: ${hour}:00 - ${hour+1}:00`}
                                                formatter={(value) => [`${value} reservations`, 'Count']}
                                            />
                                            <Bar
                                                dataKey="count"
                                                fill="#27ae60"
                                                radius={[4, 4, 0, 0]}
                                                name="Reservations"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Daily Reservations Chart */}
                        <div className="stat-card">
                            <div className="card-header">
                                <FiCalendar /> Daily Reservations
                            </div>
                            <div className="card-body">
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={filteredCharts.dailyReservations}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value) => [`${value} reservations`, 'Count']}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="count"
                                                stroke="#2ecc71"
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                                activeDot={{ r: 6 }}
                                                name="Reservations"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Revenue Chart */}
                        <div className="stat-card">
                            <div className="card-header">
                                <FaMoneyBillWave /> Revenue
                            </div>
                            <div className="card-body">
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={filteredCharts.revenueChart}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value) => [`${value} ${stats.currency}`, 'Amount']}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="amount"
                                                stroke="#1abc9c"
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                                activeDot={{ r: 6 }}
                                                name="Revenue"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Payouts Chart */}
                        <div className="stat-card">
                            <div className="card-header">
                                <FiCreditCard /> Payouts
                            </div>
                            <div className="card-body">
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={filteredCharts.payoutChart}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value) => [`${value} ${stats.currency}`, 'Amount']}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="amount"
                                                stroke="#e67e22"
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                                activeDot={{ r: 6 }}
                                                name="Payouts"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'recommendations' && recommendations.length > 0 && (
                <div className="stat-card fade-in">
                    <div className="card-header">
                        <FiAlertCircle /> Recommendations
                    </div>
                    <div className="card-body">
                        <div className="space-y-4">
                            {recommendations.map((rec, i) => (
                                <div key={i} className="recommendation-item">
                                    <div className="recommendation-icon">
                                        {i+1}
                                    </div>
                                    <div className="recommendation-text">
                                        {rec}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParkingStatisticsPage;